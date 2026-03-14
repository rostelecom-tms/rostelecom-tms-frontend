import {api} from "../axios.ts";
import type {IGroup, IGroupCreateRequest, IGroupUpdateRequest} from "../../models/case/group.ts";

export default {
    list: async (): Promise<IGroup[]> => {
        const response = await api.get<IGroup[]>(`/case-groups`)
        return response.data
    },

    create: async (request: IGroupCreateRequest): Promise<IGroup> => {
        const response = await api.post<IGroup>(`/case-groups`, request)
        return response.data
    },

    update: async (id: number, request: IGroupUpdateRequest): Promise<void> => {
        await api.patch<void>(`/case-groups/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/case-groups/${id}`)
    }
}