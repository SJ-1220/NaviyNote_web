/**
 * NextAuth OAuth handler — kept in naviynote_web because next-auth v4 requires
 * the /api/auth/* routes to be co-located with the Next.js frontend app.
 *
 * There is NO direct database access here; all session data comes from the
 * OAuth provider (Naver). Data persistence (users, etc.) belongs to naviynote_api.
 */
import NextAuth from 'next-auth'
import NaverProvider from 'next-auth/providers/naver'

const handler = NextAuth({
  providers: [
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
      authorization: {
        url: 'https://nid.naver.com/oauth2.0/authorize',
        params: {
          response_type: 'code',
          scope: 'calendar',
          auth_type: 'reprompt',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl + '/main'
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.accessToken) {
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
