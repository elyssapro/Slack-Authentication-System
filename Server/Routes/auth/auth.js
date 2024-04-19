/**
 * Node modules and Router
 */

const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const connection = require('../../Config/database');
const { v4: uuid } = require("uuid");
const nodemailer = require("nodemailer");
const { text } = require("body-parser");
const AuthLayout = "../Views/Layouts/Auth/auth-signin-signup.ejs";
const VerifyEmailLayout = "../Views/Layouts/Auth/verify-email.ejs";
const checkUserExistance = require("../../Middleware/check-user-existance");
/**
 * Routes
 */


/**
 * Sign In Page
 * Method: GET
 * URL: /auth-signin
 */

Router.get("/auth-signin", (req, res) => {
    const locals = {
        title: "Sign In"
    }
    res.render("../Views/App/Auth/auth-signin.ejs", { layout: AuthLayout, locals })
})



/**
 * Sign In Page
 * Method: POST
 * URL: /auth-signin
 */

Router.post("/auth-signin", async(req, res) => {
    const { username, password } = req.body;

    try {
        // Retrieve all the records from the database according to the provided username and password
        connection.query("SELECT * FROM users WHERE username = ?", [username], async(error, results) => {
            if(error) {
                console.error("Error retrieving records from the database:", error);
                return res.status(500).json({ success: false, message: "Error retrieving records from the database."})
            }

            if (results.length === 0) {
                console.log(`User with the username '${username}' does not exist.`);
                return res.status(404).json({ success: false, message: `User with username '${username}' does not exists.`})
            }

            const user = results[0]
            const userID = user.user_id
            // Compare the hashedPassword with the provided password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                console.log("Password does not match!");
                return res.status(401).json({ success: false, message: "Password does not match!"})
            }

            console.log("User is authenticated successfully!")
            res.status(200).json({ success: true, message: "User is authenticated successfullyy!", userID: userID })
        })
    } catch (error) {
        console.error("Internal Server Error:", error)
    }
    
    
})


/**
 * Sign Up Page
 * Method: GET
 * URL: /auth-signup
 */

Router.get("/auth-signup", (req, res) => {
    const locals = {
        title: "Sign Up"
    }
    res.render("../Views/App/Auth/auth-signup.ejs", { layout: AuthLayout, locals })
})



/**
 * Sign Up Page
 * Method: POST
 * URL: /auth-signup
 */

Router.post("/auth-signup", async(req, res) => {
    const { username, email, password } = req.body;
    const user_id = uuid();
    const verificationCode = generateVerificationCode();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the username or email already exists.
        connection.query("SELECT * FROM users WHERE username = ?", [username], (error, results) => {
            if (error) {
                console.log("Error checking username or email.", error);
                return res.status(500).json({ success: false, message: "Error checking username or email." });
            }

            if (results.length > 0) {
                console.log("Username or email already exists.")
                return res.status(400).json({ success: false, message: "Username or email already exists."});
            }

            const query = "INSERT INTO users (user_id, username, email, password, created_at) VALUES(?, ?, ?, ?, NOW())";
            connection.query(query, [user_id, username, email, hashedPassword], (error, results) => {
                if(error) {
                    console.error("Error inserting data in the users table.", error);
                    return res.status(500).json({ success: false, message: "Error inserting records in the users table."})
                }

                sendVerificationEmail(email, verificationCode)

                console.log("User inserted successfully.");
                res.status(200).json({ success: true, message: "User inserted successfully in the database.", userID: user_id, verificationCode: verificationCode})
            })

        })
        
    } catch (error) {
        console.error("Internal Server Error:", error)
    }
    
})


function sendVerificationEmail(email, verificationCode) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "edudridge@gmail.com",
            pass: "nbqo dohe bheb wplf"
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    // Config email options
    const emailOptions = {
        from: "edubridge@gmail.com",
        to: email,
        subject: "Verification Code",
        text: `Your verification code is: ${verificationCode}`
    }

    // Send Emails
    transporter.sendMail(emailOptions, (error, info) => {
        if(error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Verification code sent:", info.response)
        }
    })
}


// Function to generate random verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Verify Email
 * Method: GET
 * URL: /verify-email/:id
 */

Router.get("/verify-email/:id", checkUserExistance, (req, res) => {
    res.render("../Views/App/Auth/verify-email.ejs", { layout: VerifyEmailLayout })
})


/**
 * Verify Email
 * Method: POST
 * URL: /verify-email/:id
 */

Router.post("/verify-code/:id", async(req, res) => {
    const { userVerificationCode, systemVerificationCode } = req.body;
    console.log("request body:", req.body)
    const userID = req.params.id
    
    try {
        // Check if the userID exists in the database
        const query = "SELECT * FROM users WHERE user_id = ?";
        connection.query(query, [userID], (error, results) => {
            if (error) {
                console.log("Error checking the user Id");
                return res.status(500).json({ success: false, message: "Error checking the userID."});
            }

            if (results.length === 0) {
                console.log(`No data found matching with the userID: ${userID}`);
                return res.status(404).json({ success: false, message: `No data found matching with userID: ${userID}`})
            }

            const user = results[0];

            // Check if the user verification code matches with the system code
            if (userVerificationCode !== systemVerificationCode) {
                console.error("Verification code does not match!");
                return res.status(401).json({ success: false, message: "Verification code does not match!"});
            }

            console.log("Verification code match!");
            res.status(200).json({ success: true, message: "Verification code match!", userID: userID});
        })
    } catch (error) {
        console.error("Internal Server Error:", error);
    }
})






 
/**
 * Export Router Module
 */

module.exports = Router