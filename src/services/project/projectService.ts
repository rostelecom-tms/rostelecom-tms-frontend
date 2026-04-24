import {api} from "../axios.ts";
import type {
    IProject,
    IProjectAccessRequest,
    IProjectAccessRequestCreateRequest,
    IProjectAccessRequestDecisionRequest,
    IProjectCreateRequest,
    IProjectUpdateRequest
} from "../../models/project/project.ts";

export default {
    list: async (): Promise<IProject[]> => {
        const response = await api.get<IProject[]>(`/projects`)
        return response.data
    },

    get: async (id: number): Promise<IProject> => {
        const response = await api.get<IProject>(`/projects/${id}`)
        return response.data
    },

    create: async (request: IProjectCreateRequest): Promise<IProject> => {
        const response = await api.post<IProject>(`/projects`, request)
        return response.data
    },

    update: async (id: number, request: IProjectUpdateRequest): Promise<void> => {
        await api.patch<void>(`/projects/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/projects/${id}`)
    },

    addMember: async (projectId: number, userId: number): Promise<void> => {
        await api.post<void>(`/projects/${projectId}/members`, {userId})
    },

    removeMember: async (projectId: number, userId: number): Promise<void> => {
        await api.delete<void>(`/projects/${projectId}/members/${userId}`)
    },

    createAccessRequest: async (request: IProjectAccessRequestCreateRequest): Promise<IProjectAccessRequest> => {
        const response = await api.post<IProjectAccessRequest>(`/project-access-requests`, request)
        return response.data
    },

    getAccessRequestInbox: async (): Promise<IProjectAccessRequest[]> => {
        const response = await api.get<IProjectAccessRequest[]>(`/project-access-requests/inbox`)
        return response.data
    },

    approveAccessRequest: async (id: number, request?: IProjectAccessRequestDecisionRequest): Promise<void> => {
        await api.post<void>(`/project-access-requests/${id}/approve`, request ?? {})
    },

    rejectAccessRequest: async (id: number, request?: IProjectAccessRequestDecisionRequest): Promise<void> => {
        await api.post<void>(`/project-access-requests/${id}/reject`, request ?? {})
    },
}
