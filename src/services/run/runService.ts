import {api} from "../axios.ts";
import type {IRun, IRunBulkCreateRequest, IRunCreateRequest, IRunListParams, IRunStatus} from "../../models/run/run.ts";
import type {IPageResponse} from "../../models/common/pagination.ts";

export default {
    listPage: async (params?: IRunListParams): Promise<IPageResponse<IRun>> => {
        const response = await api.get<IPageResponse<IRun>>("/runs", {params})
        return response.data
    },

    list: async (params?: IRunListParams): Promise<IRun[]> => {
        const response = await api.get<IPageResponse<IRun>>("/runs", {
            params: {
                page: 0,
                size: 100,
                ...params,
            }
        })
        return response.data.content
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
