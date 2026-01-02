import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyTelegramWebAppData } from "@/lib/telegram/auth";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            id: "telegram-login",
            name: "Telegram",
            credentials: {
                id: { label: "ID", type: "text" },
                first_name: { label: "First Name", type: "text" },
                last_name: { label: "Last Name", type: "text" },
                username: { label: "Username", type: "text" },
                photo_url: { label: "Photo URL", type: "text" },
                auth_date: { label: "Auth Date", type: "text" },
                hash: { label: "Hash", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials) return null;

                // Verify Telegram data
                const isValid = verifyTelegramWebAppData(credentials as any, process.env.TELEGRAM_BOT_TOKEN || "");

                if (!isValid) {
                    throw new Error("Invalid Telegram hash");
                }

                // Check for staleness (optional, e.g. 24 hours)
                const now = Math.floor(Date.now() / 1000);
                if (now - parseInt(credentials.auth_date) > 86400) {
                    throw new Error("Data is outdated");
                }

                await dbConnect();

                // Find or create user
                let user = await User.findOne({ telegramId: credentials.id });
                if (!user) {
                    // CHECK SIGNUP SETTING
                    const { default: Setting } = await import("@/models/Setting");
                    const signupSetting = await Setting.findOne({ key: 'signupsEnabled' });

                    if (signupSetting && signupSetting.value === false) {
                        throw new Error("Signups are currently disabled.");
                    }

                    user = await User.create({
                        telegramId: credentials.id,
                        username: credentials.username || `user_${credentials.id}`,
                        // We might not get email from Telegram
                        avatar: credentials.photo_url,
                        plan: 'free',
                    });
                } else {
                    user.lastLogin = new Date();
                    await user.save();
                }

                return {
                    id: user._id.toString(),
                    name: user.username,
                    image: user.avatar,
                    email: user.email, // might be undefined
                    role: user.role,
                    plan: user.plan
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await dbConnect();

                const existingUser = await User.findOne({ googleId: profile?.sub });
                if (!existingUser) {
                    // Check if email exists
                    const emailUser = await User.findOne({ email: user.email });
                    if (emailUser) {
                        emailUser.googleId = profile?.sub as string;
                        await emailUser.save();
                        user.id = emailUser._id.toString();
                        return true;
                    }

                    // CHECK SIGNUP SETTING
                    const { default: Setting } = await import("@/models/Setting");
                    const signupSetting = await Setting.findOne({ key: 'signupsEnabled' });

                    if (signupSetting && signupSetting.value === false) {
                        // Reject new signup
                        return `/login?error=${encodeURIComponent("Signups are currently disabled by the administrator")}`;
                    }

                    const newUser = await User.create({
                        googleId: profile?.sub,
                        email: user.email,
                        username: user.name || user.email?.split('@')[0] || 'User',
                        avatar: user.image,
                        plan: 'free',
                        role: 'user'
                    } as any);
                    user.id = (newUser as any)._id.toString();
                    // @ts-ignore
                    user.role = (newUser as any).role;
                } else {
                    user.id = existingUser._id.toString();
                    // @ts-ignore
                    user.role = existingUser.role;
                    // @ts-ignore
                    user.plan = existingUser.plan;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.sub;
                // @ts-ignore
                session.user.plan = token.plan;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                // @ts-ignore
                const u = user as any;
                if (u.plan) token.plan = u.plan;
                // @ts-ignore
                if (u.role) token.role = u.role;
            }

            // Update session if user updates via update() method
            if (trigger === "update" && session) {
                if (session.user.role) token.role = session.user.role;
                if (session.user.plan) token.plan = session.user.plan;
            }

            // Optional: Fetch fresh role from DB on every JWT access to ensure admin revocation is instant.
            // However, verifyAdmin() already checks DB, so this is mostly for UI.

            return token;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
