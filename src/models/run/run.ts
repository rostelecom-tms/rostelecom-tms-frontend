export interface IRun {
    id: number
    caseId: number
    caseTitle?: string
    planId: number
    planName?: string
    statusId: number
    statusName: string
    statusSlug: string
    executedBy?: number
    executedByUsername?: string
    executedByEmail?: string
    executedAt: string
}

export interface IRunStatus {
    id: number
    name: string
    slug: string
}

export interface IRunListParams {
    planId?: number
    caseId?: number
    statusId?: number
    statusSlug?: string
    executedBy?: number
    executedFrom?: string
    executedTo?: string
    groupId?: number
}

export interface IRunCreateRequest {
    planId: number
    caseId: number
    statusId: number
    executedBy?: number
    executedAt: string
}

export interface IRunBulkResultRequest {
    caseId: number
    statusSlug: string
    executedAt: string
}

export interface IRunBulkCreateRequest {
    planId: number
    executedBy?: number
    results: IRunBulkResultRequest[]
}
