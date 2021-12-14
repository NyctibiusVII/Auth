import Router from 'next/router'
import { createContext, ReactNode, useEffect, useState } from 'react'
import { setCookie, destroyCookie, parseCookies } from 'nookies'

import { api } from '../services/apiClient'

type User = {
    email: string
    roles: string[]
    permissions: string[]
}
type SignInCredentials = {
    email: string
    password: string
}
interface AuthContextData {
    signIn(credentials: SignInCredentials): Promise<void>
    isAuthenticated: boolean
    user: User | undefined
}

export const AuthContext = createContext({} as AuthContextData)

export const signOut = () => {
    destroyCookie(undefined, 'auth_app.token')
    destroyCookie(undefined, 'auth_app.refreshToken')

    Router.push('/') // Redirect to login
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [ user, setUser ] = useState<User>()
    const isAuthenticated = !!user

    useEffect(() => {
        const { 'auth_app.token': tokenCookie } = parseCookies()

        if (tokenCookie) {
            api.get('/me')
                .then(res => {
                    const { email, roles, permissions } = res.data

                    setUser({ email, roles, permissions })
                })
                .catch(() => signOut())
        }
    }, [])

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('/sessions', { email, password })
            const { token, refreshToken, roles, permissions } = response.data

            /** Para manter dados:
             *  1. localStorage (só funciona em browsers(client), não em SSR(server side rendering)/Node/Backend)
             *      1.1. Salvar o token no localStorage
             *      1.2. Salvar o refreshToken no localStorage
             *
             *  2. sessionStorage (dura somente a sessão, quando o navegador/pagina é fechada o conteúdo é apagado)
             *      2.1. Salvar o token no sessionStorage
             *      2.2. Salvar o refreshToken no sessionStorage
             *
             *  3. cookies* (pode ser usado em browsers(client) e SSR/Node/Backend)
             *      3.1. Salvar o token no cookie
             *      3.2. Salvar o refreshToken no cookie
             */

            setCookie(undefined, 'auth_app.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days (seconds * minutes * hours * days)
                path: '/', // Quando só '/' o cookie é acessível em toda a aplicação (cookie global)
            })
            setCookie(undefined, 'auth_app.refreshToken', refreshToken, { maxAge: 60 * 60 * 24 * 30, path: '/' })

            setUser({ email, roles, permissions })

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')
        } catch (err) { console.log(err) }
    }

    return (
        <AuthContext.Provider
            value={{ signIn, isAuthenticated, user }}
        >
            {children}
        </AuthContext.Provider>
    )
}