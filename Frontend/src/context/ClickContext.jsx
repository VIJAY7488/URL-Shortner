import { createContext, useState } from "react";

export const ClickContext = createContext();

export const ClickProvider = ({children}) => {
    const [dailyClick, setDailyClick] = useState({});
    const [totalUserClicks, setTotalUserClicks] = useState({});
    const [error, setError] = useState('');

    return (
        <ClickContext.Provider value={{
            dailyClick,
            setDailyClick,
            totalUserClicks,
            setTotalUserClicks,
            error,
            setError
        }}>
            {children}
        </ClickContext.Provider>
    )
}