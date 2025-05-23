const dotenv = require("dotenv");
const connectDB = require("./monogo.config");

dotenv.config(); // load environment variables from a .env file 

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 1000 * 60 * 60, // 5 minutes
};

module.exports = {
    cookieOptions,
    PORT: process.env.PORT,
}


