import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "System Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        
        // 1. Check if the user already exists in the database
        let user = await User.findOne({ email: credentials.email });
        
        // 2. If it is a new user logging in, register them automatically
        if (!user) {
          // ESTABLISH THE FOUNDER: Change this to your real email!
          const isFounder = credentials.email === "ankitkumarjha10022005@gmail.com";
          
          user = await User.create({
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: isFounder ? 'Founder' : 'Member',
            allowedStages: isFounder ? ['todo', 'production', 'checking'] : []
          });
        }
        
        // 3. Return the user data to be encrypted into the session
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  }
})