import {Navigate, Route, Routes} from "react-router";
import {DashboardPage} from "./pages/dashboard/DashboardPage.tsx";
import {AppLayout} from "./components/layout/AppLayout.tsx";

export const App = () => {
    return (
        <Routes>
            {/*<Route path="/test-cases" element={<TestCasesPage />} />*/}
            <Route path="/" element={<AppLayout/>}>
                <Route path="/" element={<DashboardPage/>}/>
            </Route>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    )
}
