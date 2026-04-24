import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import projectService from "../../services/project/projectService.ts";
import type {
    IProjectAccessRequestCreateRequest,
    IProjectAccessRequestDecisionRequest,
    IProjectCreateRequest
} from "../../models/project/project.ts";

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: projectService.list,
        retry: false,
    })
}

export const useCreateProject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: IProjectCreateRequest) => projectService.create(request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['projects']})
        },
    })
}

export const useAddProjectMember = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({projectId, userId}: {projectId: number; userId: number}) =>
            projectService.addMember(projectId, userId),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['projects']})
            void queryClient.invalidateQueries({queryKey: ['users']})
        },
    })
}

export const useRemoveProjectMember = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({projectId, userId}: {projectId: number; userId: number}) =>
            projectService.removeMember(projectId, userId),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['projects']})
            void queryClient.invalidateQueries({queryKey: ['users']})
        },
    })
}

export const useCreateProjectAccessRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: IProjectAccessRequestCreateRequest) => projectService.createAccessRequest(request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['project-access-requests-inbox']})
        },
    })
}

export const useProjectAccessRequestInbox = (enabled = true) => {
    return useQuery({
        queryKey: ['project-access-requests-inbox'],
        queryFn: projectService.getAccessRequestInbox,
        retry: false,
        enabled,
    })
}

export const useApproveProjectAccessRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, request}: {id: number; request?: IProjectAccessRequestDecisionRequest}) =>
            projectService.approveAccessRequest(id, request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['project-access-requests-inbox']})
            void queryClient.invalidateQueries({queryKey: ['projects']})
            void queryClient.invalidateQueries({queryKey: ['users']})
        },
    })
}

export const useRejectProjectAccessRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, request}: {id: number; request?: IProjectAccessRequestDecisionRequest}) =>
            projectService.rejectAccessRequest(id, request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['project-access-requests-inbox']})
        },
    })
}
