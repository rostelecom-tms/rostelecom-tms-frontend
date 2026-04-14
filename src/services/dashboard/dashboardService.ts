import {api} from "../axios.ts";
import type {IDashboardResponse} from "../../models/dashboard/dashboard.ts";

export default {
    get: async (): Promise<IDashboardResponse> => {
        const response = await api.get<IDashboardResponse>("/dashboard")
        return response.data
    }
}
