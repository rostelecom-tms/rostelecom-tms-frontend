import {api} from "../axios.ts";
import type {IRun, IRunBulkCreateRequest, IRunCreateRequest, IRunListParams, IRunStatus} from "../../models/run/run.ts";

export default {
    list: async (params?: IRunListParams): Promise<IRun[]> => {
        const response = await api.get<IRun[]>("/runs", {params})
        return response.data
    },

    statuses: async (): Promise<IRunStatus[]> => {
        const response = await api.get<IRunStatus[]>("/runs/statuses")
        return response.data
    },

    create: async (request: IRunCreateRequest): Promise<IRun> => {
        const response = await api.post<IRun>("/runs", request)
        return response.data
    },

    createBulk: async (request: IRunBulkCreateRequest): Promise<IRun[]> => {
        const response = await api.post<IRun[]>("/runs/bulk", request)
        return response.data
    },
}
