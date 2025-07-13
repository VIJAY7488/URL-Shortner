import { createContext, useState } from "react";

export const UrlContext = createContext();

export const UrlProvider = ({children}) => {
    const [publicUrl, setPublicUrl] = useState('');
    const [error, setError] = useState(null);

    return (
        <UrlContext.Provider value={{
            publicUrl,
            setPublicUrl,
            error,
            setError
        }}>
            {children}
        </UrlContext.Provider>
    )
}