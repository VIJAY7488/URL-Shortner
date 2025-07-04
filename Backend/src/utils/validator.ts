import Joi from "joi";

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

export const validateUserRegistration = (data: UserRegistrationData) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });

    return schema.validate(data);
};


