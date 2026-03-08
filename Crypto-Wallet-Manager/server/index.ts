import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import { registerRoutes } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isDev = process.env.NODE_ENV === "development";

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Session ─────────────────────────────────────────────────────────────────
const PgSession = connectPgSimple(session);

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !isDev,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // "lax" is safe for server-side redirect flows (the standard OAuth pattern)
      // and provides CSRF protection. Use "none" only when embedding in cross-origin
      // iframes – which is not required here.
      sameSite: "lax",
    },
  }),
);

// ── API routes ───────────────────────────────────────────────────────────────
registerRoutes(app);

// ── Static assets (production only) ─────────────────────────────────────────
if (!isDev) {
  const staticPath = path.resolve(__dirname, "public");
  app.use(express.static(staticPath));

  // SPA fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? "5000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
});

export { app };
