import jwt from 'jsonwebtoken';
export const generateAccessToken = (userId) => {
    const secret = process.env.ACCESS_TOKEN;
    return jwt.sign({ userId: userId }, secret, { expiresIn: '6h' });
};
export const generateRefreshToken = (userId) => {
    const secret = process.env.REFRESH_TOKEN;
    return jwt.sign({ userId: userId }, secret, { expiresIn: '7d' });
};
