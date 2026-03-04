import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    // const location = useLocation();
    return (
        (auth)
            ? <Outlet />
            : <Navigate to="/" />
    );
}

export default RequireAuth;