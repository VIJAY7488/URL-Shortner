const { cookieOptions } = require("../config");
const { registerUser, loginUser } = require("../services/auth.service");
const wrapAsync = require("../utils/tryCatchWrapper");

const register_user = wrapAsync(async(req, res) => {
    const {name, email, password} = req.body;
    const {token, user} = await registerUser(name, email, password);
    req.user = user;
    res.cookies("accessToken", token, cookieOptions);
    res.status(200).json({message:"register success"});
});

const login_user = wrapAsync(async(req, res) => {
    const {email, password} = req.body;
    const {token, user} = await loginUser(email, password);
    req.user = user
    res.cookie("accessToken", token, cookieOptions)
    res.status(200).json({user:user,message:"login success"})
});

const logout_user = wrapAsync(async(req, res) => {
    res.clearCookie("accessToken", cookieOptions);
    res.status(200).json({message:"logout success"})
});

const get_current_user = wrapAsync(async(req, res) => {
    res.status(200).json({user:req.user});
});

module.exports = {
    register_user,
    login_user,
    logout_user,
    get_current_user
}