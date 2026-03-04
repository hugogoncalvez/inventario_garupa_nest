import { createContext, useState } from "react";

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