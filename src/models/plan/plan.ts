import type {IUserCompact} from "../user/user.ts";
import type {ICaseCompact} from "../case/case.ts";

export interface IPlan {
    id: number
    name: string
    introduction: string
    approach: string
    startDate: string
    endDate: string
    projectId?: number
    responsibleUser?: IUserCompact
    createdAt: string
    cases?: ICaseCompact[]
}

export interface IPlanCreateRequest {
    name: string
    introduction: string
    approach: string
    startDate: string
    endDate: string
    responsibleUserId?: number
    projectId?: number
}

export interface IPlanUpdateRequest {
    name?: string
    introduction?: string
    approach?: string
    startDate?: string
    endDate?: string
    responsibleUserId?: number
    projectId?: number
}
