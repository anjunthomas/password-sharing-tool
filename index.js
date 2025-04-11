const dotenv = require('dotenv');
const express = require('express');
const bcrypt = require('bcrypt');
const models = require('./models');
const jwt = require('jsonwebtoken');
const {expressjwt } = require('express-jwt');

dotenv.config(); // loading environment variables from .env file
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const app = express();

app.use(express.json()); // this is a middleware to parse incoming JSON requests

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
        const dbModels = await models; // loading sequelize models (ORM Objects) that let us interact with the database

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
    const dbModels = await models.default; // loading sequelize models (ORM Objects) that let us interact with the database
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
        const matched = await bcrypt.compare(password, findUser.password);

        if (matched) {
            const token = jwt.sign(
            { user_id: findUser.id },
            process.env.JWT_SECRET,
            { algorithm: "HS256", expiresIn: "1h" }
            );
        
            return res.json({
                message: "Login successful",
                sys_message: "login_success",
                token,
                name: findUser.name
            });
        }

        res.status(403);
        res.json({message: "invalid email or password", sys_message: "login_failed" })
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'An error occured.', error: error.message})
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


