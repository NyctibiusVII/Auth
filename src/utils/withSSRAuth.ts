import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { destroyCookie, parseCookies } from 'nookies'
import { AuthTokenError } from '../services/errors/AuthTokenError'
import decode from 'jwt-decode'
import { validateUserPermissions } from './validadeUserPermissions'

type WithSSRAuthOptions = {
    roles?: string[]
    permissions?: string[]
}

export function withSSRAuth<p>(fn: GetServerSideProps<p>, options?: WithSSRAuthOptions): GetServerSideProps {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<p>> => {
        const cookies = parseCookies(ctx)
        const token = cookies['auth_app.token']

        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false
                }
            }
        }

        if (options) {
            const user = decode<{ roles: string[], permissions: string[]}>(token)
            const { roles, permissions } = options

            const userHasValidPermissions = validateUserPermissions({ user, roles, permissions })

            if (!userHasValidPermissions) {
                return {
                    redirect: {
                        destination: '/dashboard', // Redirecionando para uma pagina global onde qualquer usuario teem acesso
                        permanent: false
                    }
                }
            }
        }


        try {
            return fn(ctx)
        } catch (err) {
            if (err instanceof AuthTokenError) {
                destroyCookie(ctx, 'auth_app.token')
                destroyCookie(ctx, 'auth_app.refreshToken')

                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                }
            } else {
                return {
                    redirect: {
                        destination: '/errors',
                        permanent: false
                    }
                }
            }
        }
    }
}