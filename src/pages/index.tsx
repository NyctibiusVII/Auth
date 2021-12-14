import type { GetServerSideProps, NextPage } from 'next'

import { AuthContext } from '../contexts/AuthContext'

import { FormEvent, useContext, useState } from 'react'

import Head  from 'next/head'
import { parseCookies } from 'nookies'
import { withSSRGuest } from '../utils/withSSRGuest'

const Home: NextPage = () => {
    const [ email,    setEmail    ] = useState('')
    const [ password, setPassword ] = useState('')

    const { signIn } = useContext(AuthContext)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const data = { email, password }

        await signIn(data)
    }

    return (
        <>
            <Head><title>Login | Auth</title></Head>

            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input type='email' value={email} onChange={e => setEmail(e.target.value)} />
                <input type='password' value={password} onChange={e => setPassword(e.target.value)} />
                <button type='submit'>Entrar</button>
            </form>
        </>
    )
}
export default Home

export const getServerSideProps = withSSRGuest(async (ctx) => {


    return { props: {} }
})