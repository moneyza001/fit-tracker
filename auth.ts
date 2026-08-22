import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { credentialsSignInSchema } from "@/lib/validations";

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const { email, password } = credentialsSignInSchema.parse(raw);
      await connectToDatabase();
      const user = await User.findOne({ email });
      if (!user?.passwordHash) return null;
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }

      if (account?.provider === "google" && profile?.email) {
        await connectToDatabase();
        const email = profile.email.toLowerCase();
        const picture = (profile as { picture?: string }).picture;
        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          dbUser = await User.create({
            email,
            name: profile.name ?? undefined,
            image: picture,
          });
        } else if (!dbUser.image && picture) {
          dbUser.image = picture;
          await dbUser.save();
        }
        token.id = dbUser._id.toString();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
