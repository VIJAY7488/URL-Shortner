import Joi from 'joi';
export const validateUserRegistration = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};
export const validateUserLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};
export const validateUrl = (data) => {
    const schema = Joi.object({
        longUrl: Joi.string().uri().required()
    });
    return schema.validate({ longUrl: data });
};
