import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const LOGIN_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/login`;
console.log(LOGIN_URI);

export const useLogin = () => {
    const { setUser } = useContext(AuthContext);

    const loginUser = async(email, password) => {
        try {
            const response = await axios.post(LOGIN_URI, 
            { email, password },
            { withCredentials: true});

            setUser(response.data.user);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Login failed");
            }
            throw new Error("Login failed");
        }
    }

    return { loginUser };
}