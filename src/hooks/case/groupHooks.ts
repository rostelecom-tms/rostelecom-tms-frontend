import {useQuery} from "@tanstack/react-query";
import groupService from "../../services/case/groupService.ts";

export const useGroups = () => {
    return useQuery({
        queryKey: ['groups'],
        queryFn: groupService.list,
        retry: false
    })
}