const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT} = require("./src/config");
const connectDB = require("./src/config/monogo.config");
const attachUser = require("./src/utils/attachUser");
const authRouter = require("./src/routes/auth.routes");



const app = express();



app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use(attachUser);

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    connectDB()
    console.log("Server is running on Port " + PORT);
});
