import axios, { AxiosError } from 'axios'
import { signOut } from '../contexts/AuthContext'
import { setCookie, parseCookies } from 'nookies'
import { GetServerSidePropsContext } from 'next'

type Context = undefined | GetServerSidePropsContext
type FailedRequestQueue = {
    resolve: (token: string) => void
    reject: (err: AxiosError) => void
}

let isRefreshing = false
let failedRequestsQueue = Array<FailedRequestQueue>()

export function setupAPIClient(ctx: Context = undefined) { // or '= undefined' | ': GetServerSidePropsContext'
    let cookies = parseCookies(ctx)

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            'Authorization': `Bearer ${cookies['auth_app.token']}`
        }
    })

    api.interceptors.response.use(
    res => {
        return res
    },
    (error: AxiosError) => {
        if (!error.response) return
        if (error.response.status === 401) {
            if (error.response.data?.code === 'token.expired') {
                // Renovar token
                cookies = parseCookies(ctx)

                const { 'auth_app.refreshToken': refreshTokenCookies } = cookies
                const originalConfig = error.config

                if (!isRefreshing) {
                    isRefreshing = true

                    api.post('/refresh', {
                            refreshToken: refreshTokenCookies
                        }).then(res => {
                            const { token } = res.data

                            setCookie(ctx, 'auth_app.token', token, { maxAge: 60 * 60 * 24 * 30, path: '/' })
                            setCookie(ctx, 'auth_app.refreshToken', res.data.refreshToken, { maxAge: 60 * 60 * 24 * 30, path: '/' }) // 'res.data.refreshToken' is the new refresh token

                            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

                            failedRequestsQueue.forEach(req => req.resolve(token))
                            failedRequestsQueue = []
                        }).catch(err => {
                            failedRequestsQueue.forEach(req => req.reject(err))
                            failedRequestsQueue = []

                            if (process.browser) signOut()
                        }).finally(() => { isRefreshing = false })
                }

                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        resolve: (token: string) => { // onSuccess
                            if (!originalConfig?.headers) return

                            originalConfig.headers['Authorization'] = `Bearer ${token}`

                            resolve(api(originalConfig))
                        },
                        reject: (err: AxiosError) => { // onFailure
                            reject(err)
                        }
                    })
                })
            } else {
                if (process.browser) signOut() // Redirect to login
            }
        }

        return Promise.reject(error)
    })

    return api
}// matheus.dev.07@gmail.com