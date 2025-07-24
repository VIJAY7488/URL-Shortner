import axios from 'axios';
import { useCallback, useContext } from 'react';
import { ClickContext } from '../context/ClickContext';
import { AuthContext } from '../context/AuthContext';
import { data } from 'react-router-dom';



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

            const dailyAnalyticsData = response.data.analytics;
    
            console.log('Setting daily click:', dailyAnalyticsData);

            setDailyClick(dailyAnalyticsData);


            if(!response.success){
                setError('No getting data of indivisual url');
                return;
            }
            setError('');
            return data;
        } catch (error) {
            console.error("Axios error:", error);
            const message = error?.response?.data?.message || "Failed to get daily click";
            setError(message);
            throw new Error(message);
        }
    }, [accessToken, setDailyClick, setError]);    

    return { getDailyClick };
};