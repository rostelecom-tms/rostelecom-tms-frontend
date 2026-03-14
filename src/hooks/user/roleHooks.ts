import {useQuery} from "@tanstack/react-query";
import roleService from "../../services/user/roleService.ts";

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: roleService.list,
        retry: false
    })
}