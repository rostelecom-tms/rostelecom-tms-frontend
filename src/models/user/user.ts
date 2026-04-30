import type {IRole} from "./role.ts";

export interface IUserCompact {
    id: number
    email: string
    username: string
}

export interface IUser extends IUserCompact {
    role: IRole
    canCreatePlans?: boolean
    createdAt: string
}

export interface IUserCreateRequest {
    email: string
    username: string
    password: string
    role?: string
    canCreatePlans?: boolean
}

export interface IUserUpdateRequest {
    roleId: number
    canCreatePlans?: boolean
}

export interface IUserLoginRequest {
    email: string
    password: string
}

export interface IUserLoginResponse {
    accessToken: string
}

export interface IUserRegistrationRequest {
    email: string;
    username: string;
    password: string;
}

export interface IRegistrationRequest {
    id: number;
    email: string;
    username: string;
    createdAt: string;
}
