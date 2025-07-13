import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


const LOGOUT_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`;


export const useLogout = () => {
    const { setUser } = useContext(AuthContext);

    const logoutUser = async() => {
        try {
            const response = await axios.post(LOGOUT_URI, 
            { withCredentials: true});

            setUser(response.data.user);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Logout failed");
            }
            throw new Error("Logout failed");
        }
    }

    return { logoutUser };
}