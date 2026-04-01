import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useEffect } from "react";

const RequireAuth = ({ allowedRoles }) => {
    const { auth, setAuth } = useAuth();
    const location = useLocation();

    // Verificación de seguridad adicional en cada cambio de ruta protegida
    useEffect(() => {
        const storedAuth = localStorage.getItem('auth');
        if (auth && !storedAuth) {
            // Si hay estado en memoria pero se borró el localStorage, forzamos el logout
            setAuth(null);
        }
    }, [auth, setAuth, location.pathname]);

    return (
        (auth && localStorage.getItem('auth'))
            ? <Outlet />
            : <Navigate to="/" state={{ from: location }} replace />
    );
}

export default RequireAuth;