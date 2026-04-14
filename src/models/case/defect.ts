export interface IDefect {
    id: number
    caseId: number
    caseTitle: string
    title: string
    description?: string
    isSolved: boolean
    createdAt: string
}

export interface IDefectCreateRequest {
    caseId: number
    title: string
    description?: string
}

export interface IDefectUpdateRequest {
    title?: string
    description?: string
    isSolved?: boolean
}
