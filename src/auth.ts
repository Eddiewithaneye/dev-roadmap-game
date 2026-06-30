import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';
import { db } from '@/lib/db';
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from '@/lib/db/schema';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  providers: [Google,Github],
  session: {
    strategy: 'database',
  },
  callbacks:{
    session({ session, user }){
      if(session.user){
        session.user.id = user.id;
      }
      
      return session;
    }
  }
});
