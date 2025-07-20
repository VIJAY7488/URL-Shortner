import axios from 'axios';
import { useCallback, useContext } from 'react';
import { ClickContext } from '../context/ClickContext';
import { AuthContext } from '../context/AuthContext';



const Total_Click_User_API = `${import.meta.env.VITE_API_BASE_URL}/analytics/total-clicks`;

export const useTotalUSerClickUrl = () => {
    const { setTotalClicks, setError } = useContext(ClickContext);
    const { accessToken } = useContext(AuthContext);

    const totalUrlClick = useCallback(async (userId) => {
        try {
    
            const response = await axios.get(`${Total_Click_User_API}/${userId}`, { headers: {
               Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true
            });

            const data = response.data;
    
            console.log('Setting total click:', data.data);


            if(!data.success){
                setError(data.message);
                return;
            }
    
            setTotalClicks(data.data);
            setError('');
            return data.data;
        } catch (error) {
            console.error("Axios error:", error);
            const message = error?.response?.data?.message || "Failed to get total click";
            setError(message);
            throw new Error(message);
        }
    }, [accessToken, setTotalClicks, setError]);    

    return { totalUrlClick };
};