const mongoose = require("mongoose");
const {MONGODB_CONNECTION_STRING} = require('../config/index');

// const connectString = "mongodb+srv://ubaidismail:1234@cluster0.z7tzjo7.mongodb.net/?retryWrites=true&w=majority";

const dbConnect = async () => {
    try {

        const conn = await mongoose.connect(MONGODB_CONNECTION_STRING);
        console.log(`DataBase Connected to host: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error:${error}`);
    }
}
module.exports = dbConnect;