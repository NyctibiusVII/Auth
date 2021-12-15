import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { validateUserPermissions } from '../utils/validadeUserPermissions'

type UseCanParams = {
    roles?: string[]
    permissions?: string[]
}

export function useCan({ roles, permissions }: UseCanParams) {
    const { user, isAuthenticated } = useContext(AuthContext)

    if (!user) return false  // user is not authenticated
    if (!isAuthenticated) return false  // user is not authenticated

    const userHasValidPermissions = validateUserPermissions({ user, roles, permissions })

    return userHasValidPermissions // user has all permissions and roles
}