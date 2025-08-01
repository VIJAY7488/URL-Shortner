import { createContext, useCallback, useState } from "react";

export const ClickContext = createContext();

export const ClickProvider = ({children}) => {
    const [dailyClickData, setDailyClickData] = useState({});
    const [totalUserClicks, setTotalUserClicks] = useState({});
    const [error, setError] = useState('');
    const [loadingStates, setLoadingStates] = useState({});

    // Helper to update specific URL data
    const updateUrlAnalytics = useCallback((urlId, data) => {
      setDailyClickData(prev => ({
        ...prev,
        [urlId]: data
      }));
    }, []);

    // Helper to get specific URL data
    const getUrlAnalytics = useCallback((urlId) => {
      return dailyClickData[urlId] || null;
    }, [dailyClickData]);
  
    return (
        <ClickContext.Provider value={{
            updateUrlAnalytics,
            getUrlAnalytics,
            dailyClickData,
            setDailyClickData,
            totalUserClicks,
            setTotalUserClicks,
            error,
            setError,
            loadingStates,
            setLoadingStates
        }}>
            {children}
        </ClickContext.Provider>
    )
}