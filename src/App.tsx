import {Navigate, Route, Routes} from "react-router";
import {DashboardPage} from "./pages/dashboard/DashboardPage.tsx";
import {AppLayout} from "./components/layout/AppLayout.tsx";
import {PrivateRoute} from "./components/routes/PrivateRoute.tsx";
import {LoginPage} from "./pages/auth/LoginPage.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";
import {CasesListPage} from "./pages/case/CasesListPage.tsx";
import {OneCasePage} from "./pages/case/OneCasePage.tsx";
import {PlansListPage} from "./pages/plan/PlansListPage.tsx";
import {OnePlanPage} from "./pages/plan/OnePlanPage.tsx";
import {CreatePlanPage} from "./pages/plan/CreatePlanPage.tsx";
import {EditPlanPage} from "./pages/plan/EditPlanPage.tsx";
import {App as AntApp} from "antd";

const queryClient = new QueryClient()

export const App = () => {
    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <AntApp>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>

                    <Route element={<PrivateRoute/>}>
                        <Route path="/" element={<AppLayout/>}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage/>}/>
                            <Route path="/plans" element={<PlansListPage />} />
                            <Route path="/plans/create" element={<CreatePlanPage />} />
                            <Route path="/plans/:id" element={<OnePlanPage />} />
                            <Route path="/plans/:id/edit" element={<EditPlanPage />} />
                            <Route path="/cases" element={<CasesListPage/>}/>
                            <Route path="/cases/:id" element={<OneCasePage />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
                </AntApp>
            </QueryClientProvider>
        </StrictMode>
    )
}
