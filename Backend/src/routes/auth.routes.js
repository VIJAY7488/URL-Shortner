const express = require("express");
const { register_user, login_user, logout_user, get_current_user } = require("../controller/auth.controller");
const { get } = require("mongoose");
const authMiddleware = require("../middlewares/auth.middleware");


const authRouter = express.Router();

authRouter.post("/register", register_user);
authRouter.post("/login", login_user);
authRouter.post("/logout", logout_user);
authRouter.get("/me", authMiddleware, get_current_user);

module.exports = authRouter;