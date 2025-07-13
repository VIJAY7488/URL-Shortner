import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LOGIN_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/login`;
console.log(LOGIN_URI);

export const useLogin = () => {
    const { setUser, setAccessToken, setIsAuthenticated } = useContext(AuthContext);

    const loginUser = async(email, password) => {
        try {
            const response = await axios.post(LOGIN_URI, 
            { email, password },
            { withCredentials: true}
            );

            const userData = response.data.user;

            console.log('Success' + response.data.success);

            if(response.data.success){
                setIsAuthenticated(true);
            }

            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar
            });

            setAccessToken(userData.accessToken);

            return userData;
            
        } catch (error) {
            if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Login failed");
            }
            throw new Error("Login failed");
        }
    }

    return { loginUser };
}