import axios from 'axios';
import { useContext } from 'react';
import { UrlContext } from '../context/UrlContext';


const PUBLIC_URL_API = `${import.meta.env.VITE_API_BASE_URL}/url/public-url`;

export const usePublicUrl = () => {
    const { setPublicUrl, setError } = useContext(UrlContext);

    const generatePublicUrl = async (longUrl) => {
        try {
            console.log("Requesting:", PUBLIC_URL_API);
            console.log("Payload:", { longUrl });
    
            const response = await axios.post(PUBLIC_URL_API, { longUrl }, { withCredentials: true });

            const data = response.data;
    
            console.log("Response:", data);

            if(!data.success){
                setError(data.message);
                return;
            }
    
            setPublicUrl(data);
            setError('');
            return data;
        } catch (error) {
            console.error("Axios error:", error);
            const message = error?.response?.data?.message || "Failed to generate short URL";
            setError(message);
            throw new Error(message);
        }
    };    

    return { generatePublicUrl };
};