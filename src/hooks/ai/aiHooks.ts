import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import aiService from "../../services/ai/aiService.ts";
import type {ICaseSuggestByTextRequest, ICaseSuggestRequest, IDefectAnalysisRequest} from "../../models/ai/ai.ts";

export const useAiProviders = () => {
    return useQuery({
        queryKey: ["ai", "providers"],
        queryFn: aiService.providers,
        retry: false,
    })
}

export const useSimilarCases = (caseId?: number, limit = 5, provider?: string) => {
    return useQuery({
        queryKey: ["ai", "similar-cases", caseId, limit, provider],
        queryFn: () => aiService.similarCasesById(caseId!, limit, provider),
        enabled: Number.isFinite(caseId) && (caseId ?? 0) > 0,
        retry: false,
    })
}

export const useSimilarDefects = (
    defectId?: number,
    params?: {limit?: number; onlySolved?: boolean; provider?: string}
) => {
    return useQuery({
        queryKey: ["ai", "similar-defects", defectId, params ?? {}],
        queryFn: () => aiService.similarDefectsById(defectId!, params),
        enabled: Number.isFinite(defectId) && (defectId ?? 0) > 0,
        retry: false,
    })
}

export const useAnalyzeDefect = () => {
    return useMutation({
        mutationFn: ({defectId, request}: {defectId: number; request?: IDefectAnalysisRequest}) =>
            aiService.analyzeDefect(defectId, request),
    })
}

export const useSuggestForCase = () => {
    return useMutation({
        mutationFn: ({caseId, request}: {caseId: number; request?: ICaseSuggestRequest}) =>
            aiService.suggestForCase(caseId, request),
    })
}

export const useSuggestByText = () => {
    return useMutation({
        mutationFn: (request: ICaseSuggestByTextRequest) => aiService.suggestByText(request),
    })
}

export const useReindexAllCases = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (provider?: string) => aiService.reindexAllCases(provider),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["ai"]})
        },
    })
}

export const useReindexAllDefects = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (provider?: string) => aiService.reindexAllDefects(provider),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["ai"]})
        },
    })
}
