import type {IRole} from "./role.ts";

export interface IUser {
    id: number
    email: string
    username: string
    role: IRole
    createdAt: string
}

export interface IUserCreateRequest {
    email: string
    username: string
    password: string
}

export interface IUserUpdateRequest {
    roleId: number
}

export interface IUserLoginRequest {
    email: string
    password: string
}

export interface IUserLoginResponse {
    accessToken: string
}
