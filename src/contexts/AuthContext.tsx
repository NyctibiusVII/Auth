import { createContext, ReactNode, useState } from 'react'
import { api } from '../services/api'

type SignInCredentials = {
    email: string
    password: string
}
interface AuthContextData {
    signIn(credentials: SignInCredentials): Promise<void>
    isAuthenticated: boolean
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [ isAuthenticated, setIsAuthenticated ] = useState(false)

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('/sessions', { email, password })

            console.log(response.data)
        } catch (err) { console.log(err) }
    }

    return (
        <AuthContext.Provider
            value={{ signIn, isAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    )
}