export interface IGroup {
    id: number
    name: string
    slug: string
    projectId?: number | null
    parentId?: number | null
}

export interface IGroupCreateRequest {
    name: string
    slug: string
    projectId?: number
    parentId?: number
}

export interface IGroupUpdateRequest {
    name?: string
    slug?: string
    projectId?: number
    parentId?: number
}
