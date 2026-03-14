import type {IUser, IUserCreateRequest, IUserUpdateRequest} from "../../models/user/user.ts";
import {api} from "../axios.ts";

export default {
    list: async (): Promise<IUser[]> => {
        const response = await api.get<IUser[]>(`/users`)
        return response.data
    },

    create: async (request: IUserCreateRequest): Promise<void> => {
        await api.post<void>(`/users`, request)
    },

    update: async (id: number, request: IUserUpdateRequest): Promise<void> => {
        await api.patch<void>(`/users/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/users/${id}`)
    }
}