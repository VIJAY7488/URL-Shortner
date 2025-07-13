import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
     const [accessToken, setAccessToken] = useState(null);
     const [isAuthenticated, setIsAuthenticated] = useState(false);
     const [error, setError] = useState(null);

    return (
        <AuthContext.Provider value={{
            user, 
            setUser,
            accessToken,
            setAccessToken,
            error,
            setError,
            isAuthenticated,
            setIsAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )
}