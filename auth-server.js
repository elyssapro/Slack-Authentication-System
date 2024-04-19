/**
 * Node modules and third party packages
 */

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

/**
 * Middlewares and static files
 */

app.use(express.static("Public"));
app.use(morgan("dev"));
app.use(expressLayout);
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Express Routes
 */

app.use("/", require("./Server/Routes/auth/auth"))
app.use("/", require("./Server/Routes/app/app"))

/**
 * Initiating Express Server
 */

app.listen(PORT, (err) => {
    // Catch any error during the server initialization
    if(err) {
        console.log("Express server running an error!", err)
    }
    
    console.log(`Express server is listening on PORT ${PORT}`)
})