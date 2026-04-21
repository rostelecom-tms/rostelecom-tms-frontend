type ApiErrorBody = {
    message?: string
}

type ErrorLike = {
    response?: {
        status?: number
        data?: ApiErrorBody
    }
}

const byStatus = (status?: number): string | null => {
    if (status === 502) {
        return "AI-провайдер недоступен. Проверьте, запущен ли сервис LLM/Embedding (например, Ollama)."
    }
    if (status === 503) {
        return "AI-сервис временно недоступен. Повторите попытку позже."
    }
    if (status === 401 || status === 403) {
        return "Недостаточно прав для AI-операции. Перелогиньтесь и проверьте роль пользователя."
    }
    if (status === 404) {
        return "AI-эндпоинт не найден. Возможно, сервер запущен без новых AI-маршрутов."
    }
    if (status === 400) {
        return "Некорректный запрос к AI. Проверьте входные данные и попробуйте снова."
    }
    return null
}

const byBackendMessage = (message?: string): string | null => {
    if (!message) {
        return null
    }

    const lower = message.toLowerCase()
    if (lower.includes("embedding provider unavailable") || lower.includes("llm provider unavailable")) {
        return "AI-провайдер недоступен. Проверьте конфигурацию и доступность провайдера."
    }
    if (lower.includes("unknown embedding provider") || lower.includes("unknown llm provider")) {
        return "Указан неподдерживаемый AI-провайдер. Доступны openai/ollama."
    }
    if (lower.includes("no stored embedding") || lower.includes("reindex")) {
        return "Индекс эмбеддингов пустой. Запустите переиндексацию кейсов и дефектов."
    }
    return null
}

export const getAiErrorMessage = (error: unknown, fallback: string): string => {
    const err = error as ErrorLike
    const status = err?.response?.status
    const backendMessage = err?.response?.data?.message

    return byBackendMessage(backendMessage)
        ?? byStatus(status)
        ?? backendMessage
        ?? fallback
}
