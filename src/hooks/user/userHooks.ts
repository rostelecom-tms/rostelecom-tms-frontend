import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import userService from "../../services/user/userService.ts";
import type {IUserCreateRequest, IUserUpdateRequest, IRegistrationRequest} from "../../models/user/user.ts";
import {useNavigate} from "react-router";

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

export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: IUserCreateRequest) => userService.create(request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['users']})
        },
    })
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, request}: {id: number; request: IUserUpdateRequest}) =>
            userService.update(id, request),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['users']})
            void queryClient.invalidateQueries({queryKey: ['me']})
        },
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => userService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['users']})
            void queryClient.invalidateQueries({queryKey: ['me']})
        },
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => undefined,
        onMutate: () => {
            localStorage.removeItem('accessToken');
            queryClient.clear();
            navigate("/login", { replace: true });
        },
        retry: false,
    });
};

export const useRegistrationRequests = (enabled: boolean) => {
    return useQuery<IRegistrationRequest[]>({
        queryKey: ['registration-requests'],
        queryFn: userService.registrationRequests,
        enabled: enabled,
        retry: false
    })
}

export const useApproveRegistration = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => userService.approveRegistration(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['registration-requests']})
            void queryClient.invalidateQueries({queryKey: ['users']})
            void queryClient.invalidateQueries({queryKey: ['projects']})
        },
    })
}

export const useRejectRegistration = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => userService.rejectRegistration(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ['registration-requests']})
        },
    })
}
