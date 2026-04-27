import type {
    IUser,
    IUserCreateRequest,
    IUserLoginRequest,
    IUserLoginResponse,
    IUserUpdateRequest,
    IUserRegistrationRequest,
    IRegistrationRequest
} from "../../models/user/user.ts";
import {api} from "../axios.ts";

export default {
    me: async (): Promise<IUser> => {
        const response = await api.get<IUser>(`/auth/me`)
        return response.data
    },

    login: async (credentials: IUserLoginRequest): Promise<void> => {
        const response = await api.post<IUserLoginResponse>(`/auth/login`, credentials)
        localStorage.setItem('accessToken', response.data.accessToken)
    },

    register: async (request: IUserRegistrationRequest): Promise<void> => {
        await api.post(`/auth/register`, request)
    },

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
    },

    registrationRequests: async (): Promise<IRegistrationRequest[]> => {
        const response = await api.get<IRegistrationRequest[]>(`/users/registration-requests`)
        return response.data
    },

    approveRegistration: async (requestId: number): Promise<void> => {
        await api.post(`/users/registration-requests/${requestId}/approve`)
    },

    rejectRegistration: async (requestId: number): Promise<void> => {
        await api.post(`/users/registration-requests/${requestId}/reject`)
    }
}