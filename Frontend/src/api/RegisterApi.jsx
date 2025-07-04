import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const REGISTER_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/register`;


export const useRegister = () => {
    const { setUser } = useContext(AuthContext);

    const registerUser = async(name, email, password) => {
        try {
            const response = await axios.post(REGISTER_URI, 
            { name, email, password },
            { withCredentials: true});

            setUser(response.data.user);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Registration failed");
            }
            throw new Error("Registration failed");
        }
    }

    return { registerUser };
}