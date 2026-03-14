import { api } from './services/axios.ts'

/**
 * Initializes the application and configures its dependencies.
 */
export const init = (): void => {
    api.interceptors.request.use(config => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `${token}`
        } else {
            delete config.headers?.Authorization
        }
        return config
    })
    api.interceptors.response.use(
        r => r,
        error => {
            const status = error?.response?.status
            if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
                localStorage.removeItem('accessToken')
            }
            return Promise.reject(error)
        }
    )
}