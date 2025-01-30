import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Adding `id` field
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
