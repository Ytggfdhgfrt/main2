import * as openidClient from "openid-client";
import type { TokenEndpointResponseHelpers } from "openid-client";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db.js";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { UpsertUser, User } from "@shared/schema";

// Lazily-initialised OIDC configuration
let oidcConfig: openidClient.Configuration | null = null;

function getIssuerUrl(): string {
  return process.env.ISSUER_URL ?? "https://replit.com/oidc";
}

function getClientId(): string {
  const id = process.env.REPL_ID ?? process.env.CLIENT_ID;
  if (!id) {
    throw new Error(
      "REPL_ID (or CLIENT_ID) environment variable is required for OAuth",
    );
  }
  return id;
}

export function getCallbackUrl(req: Request): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const domain = domains.split(",")[0].trim();
    return `https://${domain}/api/callback`;
  }
  const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
  const host = req.headers.host;
  return `${proto}://${host}/api/callback`;
}

export async function getOidcConfig(): Promise<openidClient.Configuration> {
  if (!oidcConfig) {
    oidcConfig = await openidClient.discovery(
      new URL(getIssuerUrl()),
      getClientId(),
    );
  }
  return oidcConfig;
}

// ── Session typing ──────────────────────────────────────────────────────────

declare module "express-session" {
  interface SessionData {
    userId?: string;
    codeVerifier?: string;
    nonce?: string;
    state?: string;
    returnTo?: string;
  }
}

// ── User storage helpers ────────────────────────────────────────────────────

export async function upsertUser(data: UpsertUser): Promise<User> {
  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

// ── Route handlers ──────────────────────────────────────────────────────────

/** GET /api/login – kick off the PKCE authorisation flow */
export async function loginHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const config = await getOidcConfig();
  const callbackUrl = getCallbackUrl(req);

  const codeVerifier = openidClient.randomPKCECodeVerifier();
  const codeChallenge =
    await openidClient.calculatePKCECodeChallenge(codeVerifier);
  const nonce = openidClient.randomNonce();
  const state = openidClient.randomState();

  req.session.codeVerifier = codeVerifier;
  req.session.nonce = nonce;
  req.session.state = state;

  const authUrl = openidClient.buildAuthorizationUrl(
    config,
    new URLSearchParams({
      redirect_uri: callbackUrl,
      scope: "openid profile email",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
      state,
    }),
  );

  res.redirect(authUrl.href);
}

/** GET /api/callback – exchange the code for tokens and create/update user */
export async function callbackHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const config = await getOidcConfig();
  const callbackUrl = getCallbackUrl(req);

  const { codeVerifier, nonce, state } = req.session;

  if (!codeVerifier || !nonce) {
    res.status(400).send("Invalid OAuth state – please try logging in again.");
    return;
  }

  // Reconstruct the full callback URL so openid-client can validate state/code
  const currentUrl = new URL(
    req.url,
    `${req.headers["x-forwarded-proto"] ?? req.protocol}://${req.headers.host}`,
  );

  let tokens: Awaited<ReturnType<typeof openidClient.authorizationCodeGrant>>;
  try {
    tokens = await openidClient.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState: state,
    });
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(401).send("Authentication failed.");
    return;
  }

  // openid-client v6 returns `TokenEndpointResponse & TokenEndpointResponseHelpers`,
  // but TypeScript cannot resolve `claims` as callable on that intersection because
  // `TokenEndpointResponse` is indexed as `[key: string]: JsonValue` (from oauth4webapi),
  // making `claims` appear as `JsonValue | (() => IDToken | undefined)`.
  // The cast to `TokenEndpointResponseHelpers` is the correct way to access the helper
  // methods that openid-client attaches at runtime. See:
  // https://github.com/panva/openid-client/issues/673
  const tokenHelpers = tokens as unknown as TokenEndpointResponseHelpers;
  const claims = tokenHelpers.claims();
  if (!claims?.sub) {
    res.status(401).send("No subject claim in token.");
    return;
  }

  let userInfo: Record<string, unknown> = {};
  try {
    userInfo = (await openidClient.fetchUserInfo(
      config,
      tokens.access_token!,
      claims.sub,
    )) as Record<string, unknown>;
  } catch {
    // Non-fatal – fall back to id_token claims
  }

  const userData: UpsertUser = {
    id: claims.sub,
    username:
      (userInfo.preferred_username as string) ??
      (userInfo.name as string) ??
      claims.sub,
    email: (userInfo.email as string) ?? null,
    firstName: (userInfo.given_name as string) ?? null,
    lastName: (userInfo.family_name as string) ?? null,
    profileImageUrl: (userInfo.picture as string) ?? null,
  };

  const user = await upsertUser(userData);

  // Clean up PKCE/nonce from session and store userId
  delete req.session.codeVerifier;
  delete req.session.nonce;
  delete req.session.state;
  req.session.userId = user.id;

  const returnTo = req.session.returnTo ?? "/";
  delete req.session.returnTo;
  res.redirect(returnTo);
}

/** GET /api/logout – destroy session */
export function logoutHandler(req: Request, res: Response): void {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

/** Middleware: require authentication or return 401 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}
