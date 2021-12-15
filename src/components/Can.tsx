import { ReactNode } from 'react'
import { useCan } from '../hooks/useCan'

interface CanProps {
    children: ReactNode
    roles?: string[]
    permissions?: string[]
}

export const Can = ({ children, roles, permissions }: CanProps) => {
    const userCanSeeComponent = useCan({ roles, permissions })

    if (!userCanSeeComponent) {
        return <></>
    }

    return (
        <>
            { children }
        </>
    )
}