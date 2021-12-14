import axios, { AxiosError } from 'axios'
import { setCookie, parseCookies } from 'nookies'

let cookies = parseCookies()

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

            api.post('/refresh', {
                    refreshToken: refreshTokenCookies
                }).then(res => {
                    const { token } = res.data

                    setCookie(undefined, 'auth_app.token', token, { maxAge: 60 * 60 * 24 * 30, path: '/' })
                    setCookie(undefined, 'auth_app.refreshToken', res.data.refreshToken, { maxAge: 60 * 60 * 24 * 30, path: '/' }) // 'res.data.refreshToken' is the new refresh token

                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                })
        } else {
            // Logout
        }
    }
})