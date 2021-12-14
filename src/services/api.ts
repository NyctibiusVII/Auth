import axios, { AxiosError } from 'axios'
import { setCookie, parseCookies } from 'nookies'

type FailedRequestQueue = {
    resolve: (token: string) => void
    reject: (err: AxiosError) => void
}

let cookies = parseCookies()
let isRefreshing = false
let failedRequestsQueue = Array<FailedRequestQueue>()

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookies['auth_app.token']}`
    }
})

api.interceptors.response.use(res => res, (error: AxiosError) => {
    if (error.response?.status === 401) {
        if (error.response.data?.code === 'token_expired') {
            // Renovar token
            cookies = parseCookies()

            const { 'auth_app.refreshToken': refreshTokenCookies } = cookies
            const originalConfig = error.config

            if (!isRefreshing) {
                isRefreshing = true

                api.post('/refresh', {
                        refreshToken: refreshTokenCookies
                    }).then(res => {
                        const { token } = res.data

                        setCookie(undefined, 'auth_app.token', token, { maxAge: 60 * 60 * 24 * 30, path: '/' })
                        setCookie(undefined, 'auth_app.refreshToken', res.data.refreshToken, { maxAge: 60 * 60 * 24 * 30, path: '/' }) // 'res.data.refreshToken' is the new refresh token

                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

                        failedRequestsQueue.forEach(req => req.resolve(token))
                        failedRequestsQueue = []
                    }).catch(err => {
                        failedRequestsQueue.forEach(req => req.reject(err))
                        failedRequestsQueue = []
                    }).finally(() => { isRefreshing = false })
            }

            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({
                    resolve: (token: string) => { // onSuccess
                        originalConfig.headers['Authorization'] = `Bearer ${token}`

                        resolve(api(originalConfig))
                    },
                    reject: (err: AxiosError) => { // onFailure
                        reject(err)
                    }
                })
            })
        } else {
            // Logout
        }
    }
})