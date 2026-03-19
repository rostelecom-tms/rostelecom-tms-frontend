import {useQuery} from "@tanstack/react-query";
import planService from "../../services/plan/planService.ts";

export const usePlans = () => {
    return useQuery({
        queryKey: ['plans'],
        queryFn: () => planService.list(),
        retry: false
    })
}

export const usePlan = (id: number) => {
    return useQuery({
        queryKey: ['plan', id],
        queryFn: () => planService.get(id),
        retry: false
    })
}
