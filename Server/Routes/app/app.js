/**
 * Node modules and Router
 */

const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const connection = require('../../Config/database');
const nodemailer = require("nodemailer");
const AppLayout = "../Views/Layouts/Home/appLayout.ejs";
const checkUserExistance = require("../../Middleware/check-user-existance");

/**
 * Routes
 */


/**
 * Sign In Page
 * Method: GET
 * URL: /auth-signin
 */

Router.get("/dashboard/:id",  checkUserExistance, (req, res) => {
    const user = req.user;
    const locals = {
        title: "Dashboard"
    }
    res.render("../Views/App/Home/dashboard.ejs", { layout: AppLayout, locals, user})
})


 
/**
 * Export Router Module
 */

module.exports = Router