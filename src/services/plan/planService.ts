import {api} from "../axios.ts";
import type {IPlan, IPlanCreateRequest, IPlanUpdateRequest} from "../../models/plan/plan.ts";

export default {
    list: async (): Promise<IPlan[]> => {
        const response = await api.get<IPlan[]>(`/plans`)
        return response.data
    },

    get: async (id: number): Promise<IPlan> => {
        const response = await api.get<IPlan>(`/plans/${id}`)
        return response.data
    },

    create: async (request: IPlanCreateRequest): Promise<IPlan> => {
        const response = await api.post<IPlan>(`/plans`, request)
        return response.data
    },

    update: async (id: number, request: IPlanUpdateRequest): Promise<void> => {
        await api.patch<void>(`/plans/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/plans/${id}`)
    },

    addCase: async (planId: number, caseId: number): Promise<void> => {
        await api.post<void>(`/plans/${planId}/add-case/${caseId}`)
    },

    removeCase: async (planId: number, caseId: number): Promise<void> => {
        await api.delete<void>(`/plans/${planId}/remove-case/${caseId}`)
    }
}