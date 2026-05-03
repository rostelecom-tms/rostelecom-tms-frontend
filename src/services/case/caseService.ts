import {api} from "../axios.ts";
import type {ICase, ICaseCompact, ICaseCreateRequest, ICaseUpdateRequest} from "../../models/case/case.ts";
import type {IPageResponse} from "../../models/common/pagination.ts";

export interface ICaseListParams {
    groupId?: number
    planId?: number
    title?: string
    tag?: string
    createdFrom?: string
    createdTo?: string
    page?: number
    size?: number
}

export type CaseExportFormat = 'csv'
export type CaseImportFormat = 'csv' | 'pdf'

export interface ICaseImportResult {
    imported?: number
    created?: number
    updated?: number
    skipped?: number
    errors?: string[]
}

const filenameFromDisposition = (disposition?: string): string | undefined => {
    if (!disposition) {
        return undefined
    }

    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1])
    }

    const filenameMatch = disposition.match(/filename="?([^";]+)"?/i)
    return filenameMatch?.[1]
}

export default {
    listPage: async (params?: ICaseListParams): Promise<IPageResponse<ICaseCompact>> => {
        const response = await api.get<IPageResponse<ICaseCompact>>("/cases", {params})
        return response.data
    },

    list: async (groupId?: number, planId?: number): Promise<ICaseCompact[]> => {
        const response = await api.get<IPageResponse<ICaseCompact>>("/cases", {
            params: {
                groupId,
                planId,
                page: 0,
                size: 1000,
            },
        })
        return response.data.content
    },

    get: async (id: number): Promise<ICase> => {
        const response = await api.get<ICase>(`/cases/${id}`)
        return response.data
    },

    create: async (request: ICaseCreateRequest): Promise<ICase> => {
        const response = await api.post<ICase>(`/cases`, request)
        return response.data
    },

    update: async (id: number, request: ICaseUpdateRequest): Promise<void> => {
        await api.patch<void>(`/cases/${id}`, request)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/cases/${id}`)
    },

    exportCases: async (format: CaseExportFormat, params?: Omit<ICaseListParams, 'page' | 'size'>): Promise<void> => {
        const response = await api.get<Blob>("/cases/export", {
            params: {
                ...params,
                format,
            },
            responseType: 'blob',
        })

        const filename = filenameFromDisposition(response.headers['content-disposition']) ?? `test-cases.${format}`
        const url = URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    },

    exportCasePdf: async (id: number): Promise<void> => {
        const response = await api.get<Blob>(`/cases/${id}/export/pdf`, {
            responseType: 'blob',
        })

        const filename = filenameFromDisposition(response.headers['content-disposition']) ?? `test-case-${id}.pdf`
        const url = URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    },

    importCases: async (
        format: CaseImportFormat,
        file: File,
        groupId?: number
    ): Promise<ICaseImportResult> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post<ICaseImportResult>('/cases/import', formData, {
            params: {
                format,
                groupId,
            },
        })
        return response.data
    },
}
