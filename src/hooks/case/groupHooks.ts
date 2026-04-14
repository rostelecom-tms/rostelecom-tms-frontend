import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import groupService from "../../services/case/groupService.ts";
import type {IGroupCreateRequest} from "../../models/case/group.ts";

export const useGroups = () => {
    return useQuery({
        queryKey: ['groups'],
        queryFn: groupService.list,
        retry: false
    })
}

export const useCreateGroup = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: IGroupCreateRequest) => groupService.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['groups']}).then()
            queryClient.invalidateQueries({queryKey: ['cases']}).then()
        },
    })
}
