import {Navigate, Outlet, useLocation} from "react-router";
import {useMe} from "../../hooks/user/userHooks.ts";

export const PrivateRoute = () => {
    const location = useLocation()
    const { data: me, isLoading, isError } = useMe()

    if (isLoading) return <div/>

    if (isError || !me) {
        localStorage.removeItem('accessToken')
        return <Navigate to={'/login'} replace state={{ from: location }} />
    }

    return <Outlet/>
}