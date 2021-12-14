import { NextPage } from 'next'

import { AuthContext } from '../contexts/AuthContext'

import { useContext, useEffect } from 'react'
import { api } from '../services/api'

const Dashboard: NextPage = () => {
    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me')
            .then(res => console.log(res))
            .catch(err => console.log(err))
    }, [])

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
