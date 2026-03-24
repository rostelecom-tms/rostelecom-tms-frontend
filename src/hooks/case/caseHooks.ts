import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import caseService from "../../services/case/caseService.ts";
import type {ICaseCreateRequest, ICaseUpdateRequest} from "../../models/case/case.ts";

export const useCases = (groupId?: number) => {
    return useQuery({
        queryKey: ['cases', groupId],
        queryFn: () => caseService.list(groupId),
        retry: false
    })
}

export const useCase = (id: number) => {
    return useQuery({
        queryKey: ['case', id],
        queryFn: () => caseService.get(id),
        retry: false
    })
}

export const useCreateCase = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: ICaseCreateRequest) => caseService.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cases']}).then()
        },
    })
}

export const useUpdateCase = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, request}: {id: number; request: ICaseUpdateRequest}) =>
            caseService.update(id, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({queryKey: ['cases']}).then()
            queryClient.invalidateQueries({queryKey: ['case', variables.id]}).then()
        },
    })
}

export const useDeleteCase = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => caseService.delete(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: ['cases']}).then()
            queryClient.removeQueries({queryKey: ['case', id]})
        },
    })
}