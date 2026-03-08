import type { Express, Request, Response } from "express";
import {
  loginHandler,
  callbackHandler,
  logoutHandler,
  requireAuth,
  getUserById,
} from "./auth.js";

export function registerRoutes(app: Express): void {
  // ── Auth routes ────────────────────────────────────────────────────────────

  /** Initiate Replit OAuth login */
  app.get("/api/login", loginHandler);

  /** OAuth callback – exchange code, create/update user, set session */
  app.get("/api/callback", callbackHandler);

  /** Logout – destroy session */
  app.get("/api/logout", logoutHandler);

  /** Return the currently authenticated user */
  app.get(
    "/api/auth/user",
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      const user = await getUserById(req.session.userId!);
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      res.json(user);
    },
  );
}
