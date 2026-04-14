import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import defectService from "../../services/case/defectService.ts";
import type {IDefectCreateRequest, IDefectUpdateRequest} from "../../models/case/defect.ts";

export const useDefects = (caseId?: number) => {
    return useQuery({
        queryKey: ["defects", caseId],
        queryFn: () => defectService.list(caseId),
        retry: false,
    });
};

export const useCreateDefect = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: IDefectCreateRequest) => defectService.create(request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["defects"]});
        },
    });
};

export const useUpdateDefect = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, request}: {id: number; request: IDefectUpdateRequest}) =>
            defectService.update(id, request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["defects"]});
        },
    });
};
