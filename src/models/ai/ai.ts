export interface IProviderInfo {
    defaultProvider: string
    supportedProviders: string[]
}

export interface ISimilarCaseResult {
    caseId: number
    score: number
}

export interface ISimilarDefectResult {
    defectId: number
    caseId: number
    isSolved: boolean
    score: number
}

export interface IDefectAnalysisRequest {
    limit?: number
    onlySolved?: boolean
    embeddingProvider?: string
    llmProvider?: string
}

export interface ICaseSuggestRequest {
    limit?: number
    embeddingProvider?: string
    llmProvider?: string
}

export interface ICaseSuggestByTextRequest extends ICaseSuggestRequest {
    q: string
}

export interface IDefectRagAnalysis {
    defectId: number
    relatedDefectIds: number[]
    answer: string
}

export interface ICaseRagSuggestion {
    relatedCaseIds: number[]
    answer: string
}
