import axios from 'axios';
import { useContext } from 'react';
import { UrlContext } from '../context/UrlContext';
import { AuthContext } from '../context/AuthContext';


const User_URL_API = `${import.meta.env.VITE_API_BASE_URL}/url/user-url`;

export const useUserUrl = () => {
    const { setUserUrl, setError } = useContext(UrlContext);
    const { accessToken } = useContext(AuthContext);

    const generateUserUrl = async (longUrl) => {
        try {
            console.log("Requesting:", User_URL_API);
            console.log("Payload:", { longUrl });
    
            const response = await axios.post(User_URL_API, { longUrl }, { headers: {
               Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true
            });

            const data = response.data;
    
            console.log("Response:", data);

            if(!data.success){
                setError(data.message);
                return;
            }
    
            setUserUrl(data);
            setError('');
            return data;
        } catch (error) {
            console.error("Axios error:", error);
            const message = error?.response?.data?.message || "Failed to generate short URL";
            setError(message);
            throw new Error(message);
        }
    };    

    return { generateUserUrl };
};