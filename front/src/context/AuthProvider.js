import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, _setAuth] = useState(() => {
        try {
            const storedAuth = localStorage.getItem('auth');
            return storedAuth ? JSON.parse(storedAuth) : null;
        } catch (error) {
            console.error("Failed to parse auth from localStorage", error);
            return null;
        }
    });

    // Sync state with localStorage changes from other tabs/manual deletions
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'auth' || e.key === null) { // null if storage is cleared
                const storedAuth = localStorage.getItem('auth');
                _setAuth(storedAuth ? JSON.parse(storedAuth) : null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Custom setAuth that also updates localStorage
    const setAuth = (newAuth) => {
        if (newAuth) {
            localStorage.setItem('auth', JSON.stringify(newAuth));
        } else {
            localStorage.removeItem('auth');
        }
        _setAuth(newAuth);
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;