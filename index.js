const dotenv = require('dotenv');
const express = require('express');
const bcrypt = require('bcrypt');
const models = require('./models');

dotenv.config(); // loading environment variables from .env file
const app = express();

app.use(express.json()); // this is a middleware to parse incoming JSON requests

app.get('/', (req, res) => {
    res.send('Hello World!!');
});

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

//app.post('/', (req, res))
//app.patch('/', ())
//app.delete()

// PORT

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`listening on ${PORT}!!`)
});
