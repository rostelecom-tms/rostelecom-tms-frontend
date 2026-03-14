export interface IRole {
    id: number
    name: string
    slug: string
}

export interface IRoleCreateRequest {
    name: string
    slug: string
}

export interface IRoleUpdateRequest {
    name?: string
    slug?: string
}
