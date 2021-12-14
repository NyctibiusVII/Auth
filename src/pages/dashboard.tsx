import { NextPage } from 'next'

import { AuthContext } from '../contexts/AuthContext'

import { useContext } from 'react'

const Dashboard: NextPage = () => {
    const { user } = useContext(AuthContext)

    return (
        <>
            <h1>Dashboard</h1>

            { !!user &&
                <>
                    <span>Email: {user.email}</span><br/>
                    <span>Roles: {user.roles}</span><br/>
                    <span>Permissions: {user.permissions}</span>
                </>
            }
        </>
    )
}
export default Dashboard
