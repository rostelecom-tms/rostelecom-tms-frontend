import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import runService from "../../services/run/runService.ts";
import type {IRunCreateRequest, IRunListParams} from "../../models/run/run.ts";

export const useRuns = (filters?: IRunListParams, enabled = true) => {
    return useQuery({
        queryKey: ["runs", filters ?? {}],
        queryFn: () => runService.list(filters),
        retry: false,
        enabled,
    })
}

export const useRunStatuses = () => {
    return useQuery({
        queryKey: ["run-statuses"],
        queryFn: () => runService.statuses(),
        retry: false,
    })
}

export const useCreateRun = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: IRunCreateRequest) => runService.create(request),
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({queryKey: ["runs"]})
            void queryClient.invalidateQueries({queryKey: ["case", variables.caseId]})
            void queryClient.invalidateQueries({queryKey: ["plan", variables.planId]})
        },
    })
}
