const { findUserByEmail, createUser, findUserByEmailByPassword } = require("../dao/user.dao");
const { ConflictError } = require("../utils/errorHandler");
const { signToken } = require("../utils/helper");

const registerUser = async(name, email, password) => {
    const user = await findUserByEmail(email);
    if(user){
        throw new ConflictError("User already exists"); 
    }
    const newUser = await createUser(name, email, password);
    const token = await signToken({id: newUser._id});
    return {newUser, token};
};

const loginUser = async(email, password) => {
    const user = await findUserByEmailByPassword(email, password);
    if(!user) throw new Error("Invalid email or password");

    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid) throw new Error("Invalid email or password");
    const token = signToken({id: user._id});
    return {user, token};
};

module.exports = {
    registerUser,
    loginUser
}