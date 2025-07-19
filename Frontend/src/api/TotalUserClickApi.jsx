import axios from 'axios';
import { useCallback, useContext } from 'react';
import { ClickContext } from '../context/ClickContext';
import { AuthContext } from '../context/AuthContext';



const Total_Click_User_API = `${import.meta.env.VITE_API_BASE_URL}/analytics/user`;

export const useTotalUSerClickUrl = () => {
    const { setTotalClicks, setError } = useContext(ClickContext);
    const { accessToken } = useContext(AuthContext);

    const getDailyClick = useCallback(async (urlId) => {
        try {
    
            const response = await axios.get(`${Total_Click_User_API}/${urlId}`, { headers: {
               Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true
            });

            const data = response.data;
    
            console.log('Setting total click:', data);


            if(!data.success){
                setError(data.message);
                return;
            }
    
            setTotalClicks(data);
            setError('');
            return data;
        } catch (error) {
            console.error("Axios error:", error);
            const message = error?.response?.data?.message || "Failed to get total click";
            setError(message);
            throw new Error(message);
        }
    }, [accessToken, setTotalClicks, setError]);    

    return { getDailyClick };
};