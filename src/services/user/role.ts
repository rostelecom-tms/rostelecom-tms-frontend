import {api} from "../axios.ts";
import type {IRole, IRoleCreateRequest, IRoleUpdateRequest} from "../../models/user/role.ts";

export default {
    list: async (): Promise<IRole[]> => {
        const response = await api.get<IRole[]>(`/roles`)
        return response.data
    },

    create: async (request: IRoleCreateRequest): Promise<void> => {
        await api.post<void>(`/roles`, request)
    },

    update: async (id: number, request: IRoleUpdateRequest): Promise<void> => {
        await api.patch<void>(`/roles/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/roles/${id}`)
    }
}