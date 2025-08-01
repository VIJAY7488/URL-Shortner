import axios from 'axios';
import { useCallback, useContext } from 'react';
import { ClickContext } from '../context/ClickContext';
import { AuthContext } from '../context/AuthContext';




const Daily_Click_API = `${import.meta.env.VITE_API_BASE_URL}/analytics/daily`;

export const useDailyClickUrl = () => {
    const { 
        updateUrlAnalytics, 
        getUrlAnalytics, 
        setError,
        loadingStates,
        setLoadingStates  
    } = useContext(ClickContext);
    const { accessToken } = useContext(AuthContext);

    const getDailyClick = useCallback(async (urlId) => {

        // Check if we already have fresh data
        const existingData = getUrlAnalytics(urlId);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        if (existingData && existingData.fetchedAt > fiveMinutesAgo) {
          console.log('Using cached analytics for:', urlId);
          return existingData;
        }

        // Check if already loading
        if (loadingStates[urlId]) {
          console.log('Already fetching analytics for:', urlId);
          return;
        }

        try {
            setLoadingStates(prev => ({ ...prev, [urlId]: true }));
            setError('');
    
            const response = await axios.get(`${Daily_Click_API}/${urlId}`, { headers: {
               Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true
            });

            if (!response.data?.success) {
              throw new Error(response.data?.message || 'Failed to fetch analytics');
            }

            const analytics = {
               ...response.data.analytics,
               fetchedAt: Date.now() // Add timestamp for caching
            };

            updateUrlAnalytics(urlId, analytics);
            return analytics;

        
        } catch (error) {
            console.error("Axios error:", error);
            const message = error?.response?.data?.message || "Failed to get daily click";
            setError(message);
            throw new Error(message);
        }
    }, [accessToken, updateUrlAnalytics, getUrlAnalytics, setError,       loadingStates, setLoadingStates]);   
    
    const isLoading = useCallback((urlId) => {
      return !!loadingStates[urlId];
    }, [loadingStates]);

    return { 
        getDailyClick, 
        getUrlAnalytics, 
        isLoading
     };
};