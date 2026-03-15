import {useQuery} from "@tanstack/react-query";
import userService from "../../services/user/userService.ts";

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: userService.list,
        retry: false
    })
}

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: userService.me,
        retry: false
    })
}

