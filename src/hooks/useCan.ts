import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

type UseCanParams = {
    roles?: string[]
    permissions?: string[]
}

export function useCan({ roles = [], permissions = [] }: UseCanParams) {
    const { user, isAuthenticated } = useContext(AuthContext)

    if (!isAuthenticated) return false  // user is not authenticated

    // Permissions
    if (permissions.length > 0) {
        const hasAllPermissions = permissions.every(permission => user?.permissions.includes(permission))

        if (!hasAllPermissions) return false
    }

    // Roles
    if (roles.length > 0) {
        const hasAllRoles = roles.some(role => user?.roles.includes(role))

        if (!hasAllRoles) return false
    }

    return true // user has all permissions and roles
}