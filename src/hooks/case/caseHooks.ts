import {useQuery} from "@tanstack/react-query";
import caseService from "../../services/case/caseService.ts";

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
