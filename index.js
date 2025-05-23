const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const models = require('./models');

const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('./cryptoUtils');
const {expressjwt } = require('express-jwt');
const unless = require("express-unless");
expressjwt.unless = unless;

dotenv.config(); // loading environment variables from .env file
//console.log('JWT_SECRET:', process.env.JWT_SECRET);
const app = express();

app.use(cors());
app.use(express.json()); // this is a middleware to parse incoming JSON requests

models.sequelize.sync()
  .then(() => {
    console.log('Database synced');
    app.listen(5000, () => {
      console.log('Server listening on port 5000');
    });
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
});

app.get('/', (req, res) => {
    res.send('Hello World!!');
});

app.use(
    expressjwt({
      secret: process.env.JWT_SECRET,
      algorithms: ["HS256"],
    }).unless({ path: ["/login", "/signup", "/"] }) // skip protection on login/signup
);

// signup route POST
app.post('/signup', async (req, res) => {
    const { name, email, password, encryption_key
    } = req.body;

    try {
        const dbModels =  models; // loading sequelize models (ORM Objects) that let us interact with the database

        const existingEmail = await dbModels.User.findOne({ // finding is email used by user signing up already exists
            where: { email },
            attributes: ['id'] // attributes control the columns you want to fetch from the database, only return the id field of the matching user. Prevents returning entire row
        });

        if(existingEmail) {
            res.status(400);
            return res.json({
                message: "This email already exists",
                sys_message: 'email_exists'
            });
        }

        // takes the plain-text password, and turning it to a secure hashed version 
        const hashedPassword = await bcrypt.hash(password, 10); // applying 10 rounds of salt
        const hashedEncryptionKey = await bcrypt.hash(encryption_key, 10);

        //creating a new user in the databse
        const newUser = await dbModels.User.create({
            name,
            email,
            password: hashedPassword,
            encryption_key: hashedEncryptionKey
        });
        res.status(200).json({
            message: "Signup was successful!",
            userId: newUser.id
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Something went wrong during signup',
            error: error.message
        });
    }
});

// LOGIN post route
app.post('/login', async (req, res, next) => {
    const {email, password } = req.body; // pulling email and password from request body
    const dbModels = require('./models'); // loading sequelize models (ORM Objects) that let us interact with the database
    try{

        const findUser = await dbModels.User.findOne({
            attributes: ['password', 'name', 'id'], // only selecting password, name, and id
            where: { email } // looking for a user with a given email
        });

        if(!findUser){
            res.status(400);
            return res.json({message: "Invalid email or password", "sys_message": "invalid_email_password"});
        }

        // now comparing the hashed password in the DB with the user entered one
        // fetch the saved password hash from the database, compare the hash of both strings
        const matched = await bcrypt.compare(password, findUser.password);

        if (matched) {
            const token = jwt.sign(
            { user_id: findUser.id }, // to make a unique token
            process.env.JWT_SECRET, // JWT token makes the sign in secure
            { algorithm: "HS256", expiresIn: "1h" } // which algorithm you want to use to make token and when it will expire
            );
        
            return res.json({  // once token is generated, in the login api response, you can return the token
                message: "Login successful",
                sys_message: "login_success",
                token,
                name: findUser.name // return the name of the user, 
                // returning name alone because in login you may want to say hello ___ [user's name]____
            });
        }

        res.status(403);
        res.json({message: "invalid email or password", sys_message: "login_failed" })
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'An error occured.', error: error.message})
    }
});

app.post('/passwords/save', async (req, res, next) => {
    const { url, username, password, encryption_key, label } = req.body;
    const userId = req.auth.user_id;
    const modelsObj = models;
    const userRecord = await modelsObj.User.findOne({
        attributes: ['encryption_key'], where: { id: userId }
    });
    if (!userRecord) {
        res.status(403);
        return res.json({message: 'Unable to find the account'});
    }
    const matched = await bcrypt.compare(encryption_key, userRecord.encryption_key);
    if (!matched) {
        res.status(400);
        return res.json({message: 'Incorrect encryption key'});
    }
    if (!(username && password && url)) {
        res.status(400);
        return res.json({message: 'Missing parameters'});
    }
    const encryptedUsername = encrypt(username, encryption_key);
    const encryptedPassword = encrypt(password, encryption_key);
    const result = await modelsObj.UserPassword.create({
        ownerUserId: userId, password: encryptedPassword, username: encryptedUsername, url, label
    });
    // users_passwords id, owner_user_id, url, username, password, shared_by_user_id, created_at, updated_at
    res.status(200);
    res.json({message: 'Password is saved'});
});

app.post('/passwords/list', async (req, res, next) => {
    const userId = req.auth.user_id;
    const encryptionKey = req.body.encryption_key;
    const modelsObj = models;
    let passwords = await modelsObj.UserPassword.findAll({
        attributes: ['id', 'url', 'username', 'password', 'label', 'weak_encryption', 'sharedByUserId'],
        where: { ownerUserId: userId },
        include: [
            {
              model: modelsObj.User,
              as: 'SharedBy',
              attributes: ['name'],
            }
        ]
    });
    const userRecord = await modelsObj.User.findOne({
        attributes: ['encryption_key'], where: { id: userId }
    });
    const matched = await bcrypt.compare(encryptionKey, userRecord.encryption_key);
    if (!matched) {
        res.status(400);
        return res.json({message: 'Incorrect encryption key'});
    }
    const passwordsArr = [];
    for (let i = 0; i < passwords.length; i++) {
        const element = passwords[i];
        if (element.weak_encryption) {
            const decryptedPassword = decrypt(element.password, userRecord.encryption_key);// decrypted with encryption key hash
            const decryptedUserName = decrypt(element.username, userRecord.encryption_key);
            element.password = encrypt(decryptedPassword, encryptionKey);// re-encrypted with actual encryption key
            element.username = encrypt(decryptedUserName, encryptionKey);
            element.weak_encryption = false;
            await element.save();// save
        }
        const plain = element.toJSON(); 
        plain.password = decrypt(element.password, encryptionKey);
        plain.username = decrypt(element.username, encryptionKey);
        passwordsArr.push(plain);
    }
    res.status(200);
    res.json({message: 'Success', data: passwordsArr});
});

app.post('/passwords/share-password', async function(req, res) {
    try {
        const { password_id, encryption_key, email } = req.body;
        const userId = req.auth.user_id;
        const dbModels = require('./models'); // or use your cached `dbModels` if already loaded

        const passwordRow = await dbModels.UserPassword.findOne({
            attributes: ['label', 'url', 'username', 'password'],
            where: { id: password_id, ownerUserId: userId }
        });

        if (!passwordRow) {
            return res.status(400).json({ message: 'Incorrect password_id' });
        }

        const userRecord = await dbModels.User.findOne({
            attributes: ['encryption_key'],
            where: { id: userId }
        });

        const matched = await bcrypt.compare(encryption_key, userRecord.encryption_key);
        if (!matched) {
            return res.status(400).json({ message: 'Incorrect encryption key' });
        }

        const shareUserObj = await dbModels.User.findOne({
            attributes: ['id', 'encryption_key'],
            where: { email }
        });

        if (!shareUserObj) {
            return res.status(400).json({ message: 'User with that email does not exist' });
        }

        const alreadyShared = await dbModels.UserPassword.findOne({
            attributes: ['id'],
            where: {
                source_password_id: password_id,
                ownerUserId: shareUserObj.id
            }
        });

        if (alreadyShared) {
            return res.status(400).json({ message: 'This password is already shared with the user' });
        }

        // Decrypt original password
        const decryptedUsername = decrypt(passwordRow.username, encryption_key);
        const decryptedPassword = decrypt(passwordRow.password, encryption_key);

        // Encrypt with recipient's encryption key
        const encryptedSharedUsername = encrypt(decryptedUsername, shareUserObj.encryption_key);
        const encryptedSharedPassword = encrypt(decryptedPassword, shareUserObj.encryption_key);

        const newPassword = {
            ownerUserId: shareUserObj.id,
            label: passwordRow.label,
            url: passwordRow.url,
            username: encryptedSharedUsername,
            password: encryptedSharedPassword,
            sharedByUserId: userId,
            weak_encryption: true,
            source_password_id: password_id
        };

        await dbModels.UserPassword.create(newPassword);

        return res.status(200).json({ message: 'Password shared successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while sharing the password.' });
    }
});



const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`listening on ${PORT}!!`)
});

//app.post('/', (req, res))
//app.patch('/', ())
//app.delete()

// PORT


