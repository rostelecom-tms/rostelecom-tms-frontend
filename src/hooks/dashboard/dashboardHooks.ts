import {useQuery} from "@tanstack/react-query";
import dashboardService from "../../services/dashboard/dashboardService.ts";

export const useDashboard = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: () => dashboardService.get(),
        retry: false
    })
}
