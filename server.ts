import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";
import webhookHandler from "./api/webhook.ts";
import setupHandler from "./api/setup.ts";

import firebaseConfig from "./firebase-applet-config.json";

admin.initializeApp({
  projectId: firebaseConfig.projectId
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use("/api", express.json());
  
  app.post("/api/webhook", (req, res) => webhookHandler(req, res));
  app.get("/api/setup", (req, res) => setupHandler(req, res));
  
  app.post("/api/admin/reset-password", async (req, res) => {
    console.log("Reset password request body:", req.body);
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: "Missing userId or newPassword" });
    }
    try {
      await admin.auth().updateUser(userId, { password: newPassword });
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: "Failed to reset password", details: errorMessage });
    }
  });

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/", (req, res, next) => {
    if (req.headers['user-agent']?.includes('UptimeRobot') || req.query.ping) {
      return res.status(200).send("OK");
    }
    next();
  });

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
