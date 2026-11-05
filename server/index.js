require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errors");
const { UPLOAD_DIR } = require("./middleware/upload");
const ensureAdmin = require("./scripts/ensureAdmin");
const loadDemoData = require("./scripts/demoData");

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "dev-only-secret-change-me";
    console.warn("JWT_SECRET is not set; using a development secret.");
  }

  const { demo } = await connectDB();
  const admin = await ensureAdmin();
  if (demo) await loadDemoData();
  if (admin?.created) console.log(`First admin created: ${admin.email} / ${admin.password}`);

  const app = express();
  app.set("trust proxy", true);
  app.use(cors({ origin: process.env.CLIENT_URL || true }));
  app.use(express.json());

  // In demo mode the login page shows these so people can try the app
  const demoAccounts = demo
    ? [
        { label: "Admin", email: admin?.email || process.env.ADMIN_EMAIL || "admin@groupwork.local", password: admin?.password || process.env.ADMIN_PASSWORD || "admin123" },
        { label: "Employee", email: "amina@groupwork.local", password: "password" },
      ]
    : [];
  app.get("/api/health", (_req, res) => res.json({ ok: true, demo, demoAccounts }));
  app.use("/uploads", express.static(UPLOAD_DIR));
  app.use("/api", routes);

  // Serve the built React app in production (after `npm run build` in /client)
  const clientDist = path.join(__dirname, "..", "client", "dist");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^\/(?!api|uploads).*/, (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
  }

  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
};

start().catch((err) => {
  console.error("Failed to start:", err.message);
  process.exit(1);
});
