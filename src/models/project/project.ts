import type {IUserCompact} from "../user/user.ts";

export interface IProjectMember {
    id: number
    user: IUserCompact
    addedAt: string
}

export interface IProject {
    id: number
    name: string
    description: string
    owner: IUserCompact
    createdAt: string
    members: IProjectMember[]
}

export interface IProjectCreateRequest {
    name: string
    description?: string
}

export interface IProjectUpdateRequest {
    name?: string
    description?: string
}

export interface IProjectAccessRequest {
    id: number
    projectId: number
    projectName: string
    requester: IUserCompact
    approver?: IUserCompact
    destination: 'ADMIN' | 'TEAMLEAD'
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    comment?: string
    decisionComment?: string
    createdAt: string
    processedAt?: string
    processedBy?: IUserCompact
}

export interface IProjectAccessRequestCreateRequest {
    projectId: number
    comment?: string
}

export interface IProjectAccessRequestDecisionRequest {
    comment?: string
}
