import {api} from "../axios.ts";
import type {
    ICaseRagSuggestion,
    ICaseSuggestByTextRequest,
    ICaseSuggestRequest,
    IDefectAnalysisRequest,
    IDefectRagAnalysis,
    ILogsAnalysisRequest,
    ILogsAnalysisResponse,
    IProviderInfo,
    ISimilarCaseResult,
    ISimilarDefectResult,
} from "../../models/ai/ai.ts";

export default {
    providers: async (): Promise<IProviderInfo> => {
        const response = await api.get<IProviderInfo>("/search/providers")
        return response.data
    },

    similarCasesById: async (caseId: number, limit = 5, provider?: string): Promise<ISimilarCaseResult[]> => {
        const response = await api.get<ISimilarCaseResult[]>(`/search/cases/${caseId}/similar`, {
            params: {limit, provider},
        })
        return response.data
    },

    similarCasesByText: async (q: string, limit = 5, provider?: string): Promise<ISimilarCaseResult[]> => {
        const response = await api.get<ISimilarCaseResult[]>(`/search/cases/similar`, {
            params: {q, limit, provider},
        })
        return response.data
    },

    similarDefectsById: async (
        defectId: number,
        params?: {limit?: number; onlySolved?: boolean; provider?: string}
    ): Promise<ISimilarDefectResult[]> => {
        const response = await api.get<ISimilarDefectResult[]>(`/search/defects/${defectId}/similar`, {
            params: {
                limit: params?.limit ?? 5,
                onlySolved: params?.onlySolved ?? false,
                provider: params?.provider,
            },
        })
        return response.data
    },

    reindexCase: async (caseId: number, provider?: string): Promise<void> => {
        await api.post<void>(`/search/cases/${caseId}/reindex`, undefined, {
            params: {provider},
        })
    },

    reindexAllCases: async (provider?: string): Promise<void> => {
        await api.post<void>(`/search/cases/reindex-all`, undefined, {
            params: {provider},
        })
    },

    reindexDefect: async (defectId: number, provider?: string): Promise<void> => {
        await api.post<void>(`/search/defects/${defectId}/reindex`, undefined, {
            params: {provider},
        })
    },

    reindexAllDefects: async (provider?: string): Promise<void> => {
        await api.post<void>(`/search/defects/reindex-all`, undefined, {
            params: {provider},
        })
    },

    analyzeDefect: async (defectId: number, request?: IDefectAnalysisRequest): Promise<IDefectRagAnalysis> => {
        const response = await api.post<IDefectRagAnalysis>(`/rag/defects/${defectId}/analysis`, {
            limit: request?.limit ?? 5,
            onlySolved: request?.onlySolved ?? false,
            embeddingProvider: request?.embeddingProvider,
            llmProvider: request?.llmProvider,
        })
        return response.data
    },

    suggestForCase: async (caseId: number, request?: ICaseSuggestRequest): Promise<ICaseRagSuggestion> => {
        const response = await api.post<ICaseRagSuggestion>(`/rag/cases/${caseId}/suggest`, {
            limit: request?.limit ?? 5,
            embeddingProvider: request?.embeddingProvider,
            llmProvider: request?.llmProvider,
        })
        return response.data
    },

    suggestByText: async (request: ICaseSuggestByTextRequest): Promise<ICaseRagSuggestion> => {
        const response = await api.post<ICaseRagSuggestion>(`/rag/cases/suggest`, {
            q: request.q,
            limit: request.limit ?? 5,
            embeddingProvider: request.embeddingProvider,
            llmProvider: request.llmProvider,
        })
        return response.data
    },

    analyzeLogs: async (request: ILogsAnalysisRequest): Promise<ILogsAnalysisResponse> => {
        const response = await api.post<ILogsAnalysisResponse>(`/rag/logs/analysis`, {
            prompt: request.prompt,
            llmProvider: request.llmProvider,
        })
        return response.data
    },
}
