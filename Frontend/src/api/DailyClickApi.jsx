import axios from 'axios';
import { useCallback, useContext } from 'react';
import { ClickContext } from '../context/ClickContext';
import { AuthContext } from '../context/AuthContext';



const Daily_Click_API = `${import.meta.env.VITE_API_BASE_URL}/analytics/daily`;

export const useDailyClickUrl = () => {
    const { setDailyClick, setError } = useContext(ClickContext);
    const { accessToken } = useContext(AuthContext);

    const getDailyClick = useCallback(async (urlId) => {
        try {
    
            const response = await axios.get(`${Daily_Click_API}/${urlId}`, { headers: {
               Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true
            });

            const data = response.data;
    
            console.log('Setting daily click:', data.data);


            if(!data.success){
                setError(data.message);
                return;
            }
    
            setDailyClick(data.data);
            setError('');
            return data.data;
        } catch (error) {
            console.error("Axios error:", error);
            const message = error?.response?.data?.message || "Failed to get daily click";
            setError(message);
            throw new Error(message);
        }
    }, [accessToken, setDailyClick, setError]);    

    return { getDailyClick };
};