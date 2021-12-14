import { NextPage } from 'next'

import { AuthContext } from '../contexts/AuthContext'
import { withSSRAuth } from '../utils/withSSRAuth'

import { useContext, useEffect } from 'react'
import { api } from '../services/apiClient'
import { setupAPIClient } from '../services/api'

const Dashboard: NextPage = () => {
    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me')
            .then(res => console.log('Dashboard>useEffect>then>res: ', res))
            .catch(err => console.log('Dashboard>useEffect>catch>err: ', err))
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

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)

    const res = await apiClient.get('/me')
    console.log('Dashboard>SSR>apiClient>/me', res.data)

    return { props: {} }
})