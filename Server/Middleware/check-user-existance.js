const connection = require("../Config/database");

const checkUserExistance = (req, res, next) => {
    const userID = req.params.id;

    // Check if the userID exists in the database
    const query = "SELECT * FROM users WHERE user_id = ?";
    connection.query(query, [userID], (error, results) => {
        if (error) {
            console.log("Error retrieving records from the database.", error);
            return  res.status(500).json({ success: false, message: "Error retrieving records from the database."})
        }

        if (results.length === 0) {
            console.log(`No data found matching with userID: ${userID}`)
            return res.status(404).json({ success: false, message: `No data found matching with userID: ${userID}`});
        }

        // Attach user object to the request object for further processing
        req.user = results[0];
        next();
    })
}

module.exports = checkUserExistance