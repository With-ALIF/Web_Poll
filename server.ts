import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import webhookHandler from "./api/webhook.ts";
import setupHandler from "./api/setup.ts";
import formatNoteHandler from "./api/formatNote.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Health Checks (Must be at the top to satisfy deployment probes)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.all("/", (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (ua.includes('UptimeRobot') || ua.includes('GoogleHC') || req.query.ping) {
      return res.status(200).send("OK");
    }
    next();
  });

  app.use("/api", express.json());
  
  app.post("/api/webhook", (req, res) => webhookHandler(req, res));
  app.get("/api/setup", (req, res) => setupHandler(req, res));
  app.post("/api/note/format", (req, res) => formatNoteHandler(req, res));
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Frontend server started (Bot is now handled via Vercel Webhook)");
  });
}

startServer();
