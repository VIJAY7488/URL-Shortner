const wrapAsync = require("../utils/tryCatchWrapper");

const register_user = wrapAsync(async(req, res) => {
    const {name, email, password} = req.body;
})