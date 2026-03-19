import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import planService from "../../services/plan/planService.ts";
import type {IPlanCreateRequest, IPlanUpdateRequest} from "../../models/plan/plan.ts";

export const usePlans = () => {
    return useQuery({
        queryKey: ['plans'],
        queryFn: () => planService.list(),
        retry: false
    })
}

export const usePlan = (id: number, enabled = true) => {
    return useQuery({
        queryKey: ['plan', id],
        queryFn: () => planService.get(id),
        retry: false,
        enabled: enabled && Number.isFinite(id) && id > 0,
    })
}

export const useCreatePlan = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: IPlanCreateRequest) => planService.create(request),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['plans'] })
        },
    })
}

export const useUpdatePlan = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, request}: {id: number, request: IPlanUpdateRequest}) =>
            planService.update(id, request),
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({ queryKey: ['plans'] })
            void queryClient.invalidateQueries({ queryKey: ['plan', variables.id] })
        },
    })
}

export const useDeletePlan = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => planService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['plans'] })
        },
    })
}

export const useAddCaseToPlan = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({planId, caseId}: {planId: number, caseId: number}) =>
            planService.addCase(planId, caseId),
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({ queryKey: ['plan', variables.planId] })
            void queryClient.invalidateQueries({ queryKey: ['plans'] })
        },
    })
}

export const useRemoveCaseFromPlan = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({planId, caseId}: {planId: number, caseId: number}) =>
            planService.removeCase(planId, caseId),
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({ queryKey: ['plan', variables.planId] })
            void queryClient.invalidateQueries({ queryKey: ['plans'] })
        },
    })
}