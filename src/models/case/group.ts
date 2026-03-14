export interface IGroup {
    id: number
    name: string
    slug: string
}

export interface IGroupCreateRequest {
    name: string
    slug: string
}

export interface IGroupUpdateRequest {
    name?: string
    slug?: string
}
