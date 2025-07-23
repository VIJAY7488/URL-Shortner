import Joi from 'joi';

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


export interface UserLoginData {
  email: string;
  password: string;
}


export const validateUserLogin = (data: UserLoginData) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

export const validateUrl = (data: string) => {
  const schema = Joi.object({
    longUrl: Joi.string().uri().required()
  });

  return schema.validate({longUrl: data});
}

