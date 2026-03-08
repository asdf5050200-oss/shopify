import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Shopify API Endpoints
  app.get("/api/shopify/products", async (req, res) => {
    const storeUrl = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!storeUrl || !accessToken) {
      return res.status(400).json({ 
        error: "Shopify credentials missing. Please set SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN in settings." 
      });
    }

    try {
      const response = await fetch(`https://${storeUrl}/admin/api/2024-01/products.json`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Shopify fetch error:", error);
      res.status(500).json({ error: "Failed to fetch products from Shopify" });
    }
  });

  // Upload generated mockup to Shopify
  app.post("/api/shopify/upload-image", async (req, res) => {
    const { productId, base64Image, filename } = req.body;
    const storeUrl = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!storeUrl || !accessToken) {
      return res.status(400).json({ error: "Shopify credentials missing" });
    }

    try {
      // 1. Create product image in Shopify
      const response = await fetch(`https://${storeUrl}/admin/api/2024-01/products/${productId}/images.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: {
            attachment: base64Image.split(",")[1], // Remove data:image/png;base64,
            filename: filename || "mockup.png",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Shopify upload error:", error);
      res.status(500).json({ error: "Failed to upload image to Shopify" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
