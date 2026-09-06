/**
 * src/lib/auth/better-auth.ts
 * Better Auth server instance — email/password + Google OAuth + magic link.
 *
 * Auth data lives in the app's own Neon Postgres (tables: user / session /
 * account / verification, see src/db/schema/auth.ts). Tenant membership is
 * resolved separately from the `users` table via requireAuth().
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, haveIBeenPwned } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import { user, session, account, verification } from "@/db/schema/auth";
import { sendEmail } from "@/lib/email/send";
import { AuthLinkEmail } from "@/lib/email/templates/auth-link-email";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";
import { ensureTenantForUser } from "@/lib/tenant/provision";

const appUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    requireEmailVerification: true,
    sendResetPassword: async ({ user: u, url }) => {
      await sendEmail({
        to: u.email,
        subject: "Réinitialisez votre mot de passe Traballo",
        react: AuthLinkEmail({
          heading: "Réinitialisation du mot de passe",
          intro: "Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
          cta: "Choisir un nouveau mot de passe",
          url,
        }),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user: u, url }) => {
      await sendEmail({
        to: u.email,
        subject: "Confirmez votre adresse e-mail — Traballo",
        react: AuthLinkEmail({
          heading: "Confirmez votre e-mail",
          intro:
            "Bienvenue sur Traballo. Confirmez votre adresse pour activer votre compte.",
          cta: "Confirmer mon e-mail",
          url,
        }),
      });
    },
    afterEmailVerification: async (u) => {
      await sendEmail({
        to: u.email,
        subject: "Bienvenue sur Traballo — voici comment démarrer",
        react: WelcomeEmail({ firstName: u.name?.split(" ")[0] }),
      }).catch(() => {});
    },
  },

  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  databaseHooks: {
    user: {
      create: {
        // Provision a tenant + membership for every new user (email/password
        // and OAuth alike). Idempotent.
        after: async (created) => {
          await ensureTenantForUser({
            id: created.id,
            email: created.email,
            name: created.name,
          });
        },
      },
    },
  },

  trustedOrigins: [
    appUrl,
    `https://app.${rootDomain}`,
    `https://admin.${rootDomain}`,
    `https://${rootDomain}`,
  ],

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Votre lien de connexion Traballo",
          react: AuthLinkEmail({
            heading: "Connexion à Traballo",
            intro: "Cliquez sur le bouton ci-dessous pour vous connecter. Le lien expire dans 5 minutes.",
            cta: "Se connecter",
            url,
          }),
        });
      },
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "Ce mot de passe a été exposé dans une fuite de données. Choisissez-en un autre.",
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
