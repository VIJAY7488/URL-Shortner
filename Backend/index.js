const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT} = require("./src/config");
const connectDB = require("./src/config/monogo.config");



const app = express();



app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.listen(PORT, () => {
    connectDB()
    console.log("Server is running on Port " + PORT);
});
