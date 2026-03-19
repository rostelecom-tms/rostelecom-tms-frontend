import {api} from "../axios.ts";
import type {ICase, ICaseCompact, ICaseCreateRequest, ICaseUpdateRequest} from "../../models/case/case.ts";

export default {
    list: async (groupId?: number, planId?: number): Promise<ICaseCompact[]> => {
        const response = await api.get<ICaseCompact[]>('/cases', {
            params: {
                groupId,
                planId,
            },
        })
        return response.data
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