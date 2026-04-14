import {api} from "../axios.ts";
import type {ICase, ICaseCompact, ICaseCreateRequest, ICaseUpdateRequest} from "../../models/case/case.ts";
import type {IPageResponse} from "../../models/common/pagination.ts";

export interface ICaseListParams {
    groupId?: number
    planId?: number
    title?: string
    tag?: string
    createdFrom?: string
    createdTo?: string
    page?: number
    size?: number
}

export default {
    listPage: async (params?: ICaseListParams): Promise<IPageResponse<ICaseCompact>> => {
        const response = await api.get<IPageResponse<ICaseCompact>>("/cases", {params})
        return response.data
    },

    list: async (groupId?: number, planId?: number): Promise<ICaseCompact[]> => {
        const response = await api.get<IPageResponse<ICaseCompact>>("/cases", {
            params: {
                groupId,
                planId,
                page: 0,
                size: 1000,
            },
        })
        return response.data.content
    },

    get: async (id: number): Promise<ICase> => {
        const response = await api.get<ICase>(`/cases/${id}`)
        return response.data
    },

    create: async (request: ICaseCreateRequest): Promise<ICase> => {
        const response = await api.post<ICase>(`/cases`, request)
        return response.data
    },

    update: async (id: number, request: ICaseUpdateRequest): Promise<void> => {
        await api.patch<void>(`/cases/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/cases/${id}`)
    }
}
