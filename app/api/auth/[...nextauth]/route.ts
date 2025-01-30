import NextAuth, { NextAuthOptions } from "next-auth";

/**
 * 1. Make sure you have NEXTAUTH_URL set to the exact domain (with https://)
 *    where you are running your app. For example:
 *      NEXTAUTH_URL="https://xxxx.ngrok-free.app"
 *
 * 2. Ensure that you're using https (ngrok https URL) and not mixing different domains.
 * 3. By default, NextAuth sets `__Secure-` cookie prefixes in production. That requires
 *    a secure context (HTTPS) and consistent domain. For local development or staging
 *    via ngrok, set the domain carefully or rely on trustHost + sameSite: "none".
 */

const authOptions: NextAuthOptions = {
  // Required for NextAuth (make sure you set NEXTAUTH_SECRET in .env)
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,

  // Set your NextAuth URL in .env:
  //   NEXTAUTH_URL="https://xxxx.ngrok-free.app"
  // Or explicitly set it here (not recommended; better to use .env):
  // baseUrl: "https://xxxx.ngrok-free.app",   // only if needed

  // This tells NextAuth that we trust the host domain dynamically.
  // Useful in Next.js App Router if you're deploying to multiple environments.

  // Customize cookies if you need to override defaults (especially for dev/staging).
  // This can help ensure cookies are recognized in cross-site contexts.
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none", // important if you are doing cross-site (ngrok)
        secure: true,
        path: "/",
        // domain: "xxxx.ngrok-free.app", // optionally specify if needed
      },
    },
    // You can similarly customize other cookies:
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "none",
        secure: true,
        path: "/",
        // domain: "xxxx.ngrok-free.app",
      },
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
        // domain: "xxxx.ngrok-free.app",
      },
    },
  },

  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: {
        params: { scope: "openid" },
      },
      clientId: process.env.NEXT_PUBLIC_WLD_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"], // Keep these checks for security
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],

  callbacks: {
    async signIn({ user }) {
      // Implement any custom sign-in logic if needed
      // Return `true` to proceed or `false` to block
      return true;
    },
    // other callbacks if needed...
  },

  // Enable debug logging in development
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

// Only export HTTP methods:
export { handler as GET, handler as POST };
