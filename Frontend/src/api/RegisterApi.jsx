import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


const REGISTER_URI = `${import.meta.env.VITE_API_BASE_URL}/auth/register`;


export const useRegister = () => {
    const { setUser, setAccessToken, setIsAuthenticated } = useContext(AuthContext);
      

    const registerUser = async(name, email, password) => {
        try {
            const response = await axios.post(REGISTER_URI, 
            { name, email, password },
            { withCredentials: true});

            const userData = response.data.user;
            
            console.log(response.data.success);

            if(response.data.success){
                setIsAuthenticated(true);
            }

            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar
            });

           setAccessToken(userData.accessToken)

            return userData;
        } catch (error) {
            if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Registration failed");
            }
            throw new Error("Registration failed");
        }
    }

    return { registerUser };
}