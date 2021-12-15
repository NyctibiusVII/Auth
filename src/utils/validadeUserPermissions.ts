type User = {
    roles: string[]
    permissions: string[]
}
type ValidateUserPermissionsParams = {
    user: User
    roles?: string[]
    permissions?: string[]
}

export const validateUserPermissions = ({ user, roles = [], permissions = [] }: ValidateUserPermissionsParams) => {
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

    return true
}