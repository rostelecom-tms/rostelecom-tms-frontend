import {api} from "../axios.ts";
import type {IStep, IStepCreateRequest, IStepUpdateRequest} from "../../models/case/step.ts";

export default {
    list: async (caseId: number): Promise<IStep[]> => {
        const response = await api.get<IStep[]>(`/case/${caseId}/steps`)
        return response.data
    },

    create: async (caseId: number, request: IStepCreateRequest): Promise<IStep[]> => {
        const response = await api.post<IStep[]>(`/case/${caseId}/steps`, request)
        return response.data
    },

    update: async (id: number, request: IStepUpdateRequest): Promise<void> => {
        await api.patch<void>(`/case-steps/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/case-steps/${id}`)
    }
}