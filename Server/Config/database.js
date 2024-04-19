const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "auth-db",
    password: "@elyssa123"
});

connection.connect((err) => {
    if(err) {
        console.log("Error connecting to mysql database.", err)
    }

    console.log("Connected to mysql database:", connection.threadId)
})

const CreateAdminTable = `
    CREATE TABLE IF NOT EXISTS users (
        user_id CHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`

connection.query(CreateAdminTable, (err, result) => {
    if (err) {
        console.log("Error creating users table: ", err);
        return
    }
    console.log("Users table created successfully");
});

module.exports = connection;