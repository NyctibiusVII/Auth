import { createContext, ReactNode, useState } from 'react'

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
        console.log(email, password)
    }

    return (
        <AuthContext.Provider
            value={{ signIn, isAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    )
}