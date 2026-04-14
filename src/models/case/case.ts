import type {IStep, IStepCreateRequest, IStepUpdateRequest} from "./step.ts";
import type {IGroup} from "./group.ts";

export interface ICaseCompact {
    id: number
    title: string
    groupId: number
    tags: string[]
}

export interface ICase extends ICaseCompact{
    group: IGroup
    description: string
    preconditions: string
    postconditions: string
    tags: string[]
    steps: IStep[]
    createdAt: string
}

export interface ICaseCreateRequest {
    title: string
    groupId: number
    description?: string
    preconditions?: string
    postconditions?: string
    tags?: string[]
    steps: IStepCreateRequest[]
}

export interface ICaseUpdateRequest {
    title?: string
    groupId?: number
    description?: string
    preconditions?: string
    postconditions?: string
    tags?: string[]
    steps?: IStepUpdateRequest[]
}
