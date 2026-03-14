import type {IStep} from "./step.ts";
import type {IGroup} from "./group.ts";

export interface ICase {
    id: number
    title: string
    group: IGroup
    description: string
    preconditions: string
    postconditions: string
    steps: IStep[]
    createdAt: string
}

export interface ICaseCreateRequest {
    title: string
    groupId: number
    description?: string
    preconditions?: string
    postconditions?: string
    steps: IStep[]
}

export interface ICaseUpdateRequest {
    title?: string
    groupId?: number
    description?: string
    preconditions?: string
    postconditions?: string
    steps?: IStep[]
}
