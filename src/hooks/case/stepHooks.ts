import {useQuery} from "@tanstack/react-query";
import stepService from "../../services/case/stepService.ts";

export const useSteps = (caseId: number) => {
    return useQuery({
        queryKey: ['steps', caseId],
        queryFn: () => stepService.list(caseId),
        retry: false
    })
}