import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            plan?: string
            role?: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        plan?: string
        role?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sub: string
        plan?: string
        role?: string
    }
}
