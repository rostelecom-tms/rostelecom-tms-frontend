import {Navigate, Route, Routes} from "react-router";
import {DashboardPage} from "./pages/dashboard/DashboardPage.tsx";
import {AppLayout} from "./components/layout/AppLayout.tsx";
import {PrivateRoute} from "./components/routes/PrivateRoute.tsx";
import {LoginPage} from "./pages/auth/LoginPage.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";

const queryClient = new QueryClient()

export const App = () => {
    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>

                    <Route element={<PrivateRoute/>}>
                        <Route path="/" element={<AppLayout/>}>
                            <Route path="/" element={<DashboardPage/>}/>
                        </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </QueryClientProvider>
        </StrictMode>
    )
}
