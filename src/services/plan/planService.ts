import {api} from "../axios.ts";
import type {IPlan, IPlanCreateRequest, IPlanUpdateRequest} from "../../models/plan/plan.ts";
import type {IPageResponse} from "../../models/common/pagination.ts";

export interface IPlanListParams {
    name?: string
    responsibleUserId?: number
    projectId?: number
    startDateFrom?: string
    startDateTo?: string
    endDateFrom?: string
    endDateTo?: string
    page?: number
    size?: number
}

export default {
    listPage: async (params?: IPlanListParams): Promise<IPageResponse<IPlan>> => {
        const response = await api.get<IPageResponse<IPlan>>(`/plans`, {params})
        return response.data
    },

    list: async (): Promise<IPlan[]> => {
        const response = await api.get<IPageResponse<IPlan>>(`/plans`, {
            params: {
                page: 0,
                size: 1000,
            }
        })
        return response.data.content
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
