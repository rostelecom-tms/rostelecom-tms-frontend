export interface IStep {
    id: number
    order: number
    title: string
    action: string
    expectedResult: string
}

export interface IStepCreateRequest {
    order: number
    title: string
    action: string
    expectedResult: string
}

export interface IStepUpdateRequest {
    order?: number
    title?: string
    action?: string
    expectedResult?: string
}
