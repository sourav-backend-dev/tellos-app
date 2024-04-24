// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import fetch from 'node-fetch';
import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cookieParser from 'cookie-parser';
import http from 'http';
import addUninstallWebhookHandler from "./webhooks/app-uninstall.js";
import 'dotenv/config';


const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(cookieParser());
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());

app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (req, res, next) => {
    try {
      const response = await shopify.api.rest.Shop.all({
        session: res.locals.shopify.session,
      });

      let response_sanitized = response[0];
      const shopName = response_sanitized.myshopify_domain;
      let payload = {};

      payload.shop = response_sanitized.myshopify_domain;
      payload.shop_real_domain = response_sanitized.domain;
      payload.locale = response_sanitized.primary_locale;
      payload.email = response_sanitized.email;
      payload.currency = {};
      payload.currency.active = response_sanitized.currency;
      payload.country = response_sanitized.country_code;
      payload.routes = {};
      payload.routes.root = "/";
      payload.analytics = {};
      payload.analytics.replayQueue = [];
      payload.modules = true;
      //payload.featureAssets.shop-js = {};
      payload.PaymentButton = {};
      const options = {
        method: 'POST',
        url: process.env.TELLOS_API_BASE_URL+'shopify/install',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      };

      fetch(options.url, {
        method: options.method,
        headers: options.headers,
        body: options.body
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text(); // Convert response to text
      })
      .then(text => {
        storeJs(shopName, JSON.stringify(text))
        next(); 
      })
    } catch (error) {
      console.error('Error:', error);
      // Handle the error here, if needed
      next(error); // Pass the error to the error handling middleware
    }
  },
  shopify.redirectToShopifyOrAppRoot()
);


app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// Working Properly monthly plans 
app.post("/api/recurring_application_charge", async (req, res) => {
  const host = req.query.host;
  const name = req.query.name; 
  const price = req.query.price;
  
  if (typeof name !== 'string' || typeof price !== 'string') {
    return res.status(400).send('Invalid plan type or price');
  }

  const recurring_application_charge = new shopify.api.rest.RecurringApplicationCharge({session: res.locals.shopify.session});
  recurring_application_charge.name = name;
  recurring_application_charge.price = parseFloat(price);
  recurring_application_charge.return_url = `https://${req.hostname}/api/payment-completion?store_url=${host}`;
  recurring_application_charge.test = true;
  try {
    await recurring_application_charge.save({ update: true });
    
    // After saving, hit the GET API
    const apiUrl = process.env.TELLOS_API_BASE_URL+`shopify/plan-purchase?shop=${host}&plan=${name}&price=${price}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to hit the GET API');
    }

  res.status(200).send(recurring_application_charge);
  } catch (error) {
    console.error('Error saving recurring application charge:', error);
    res.status(500).send('Internal server error');
  }
});

// Working Properly New route to handle redirection after payment completion 
app.get("/api/payment-completion", async (req, res) => {
  const chargeId = req.query.charge_id; // Extract charge ID from query parameters
  const shop = req.query.store_url; 
  if (!chargeId || !shop) {
    return res.status(400).send("Charge ID or shop URL is missing");
  }

  // Store the charge ID in your database
  try {
    // Open the SQLite database connection
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });

    // Check if the column 'chargeID' exists in the 'shopify_sessions' table
    const columns = await db.all("PRAGMA table_info(shopify_sessions)");
    const columnExists = columns.some(column => column.name === 'chargeID');

    // If 'chargeID' column does not exist, add it
    if (!columnExists) {
      await db.run("ALTER TABLE shopify_sessions ADD COLUMN chargeID INTEGER");
    }

    // Insert the charge ID into your database table where the shop column matches the provided shop URL
    await db.run("UPDATE shopify_sessions SET chargeID = ? WHERE shop = ?", [chargeId, shop]);

    // Close the database connection
    await db.close();
  } catch (error) {
    console.error("Error storing charge ID:", error);
    return res.status(500).send("Internal Server Error");
  }

  // Redirect the user back to your Tellos admin URL
  return res.redirect(process.env.TELLOS_ADMIN_URL); 
});

// Define route to check if charge ID is present in the database
app.post("/api/check-charge-id", async (req, res) => {
  try {
    const host = req.query.host; // Extract host from query parameters
    if (!host) {
      return res.status(400).send("Host parameter is missing");
    }
    // Query the database to check if a charge ID exists for the provided host
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    const row = await db.get("SELECT chargeID FROM shopify_sessions WHERE shop = ?", [host]);
    await db.close();
    if (row.chargeID != null) {
      return res.send(true);
    } else {
      return res.send(false);
    }
  } catch (error) {
    console.error("Error checking charge ID:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});


// Send the response text file
app.listen(PORT);

function storeJs(shopName,text) {
  const key = 'tellos_js_' + shopName; // Generate a unique key using timestamp
  const value = JSON.stringify(text); // Convert text to JSON string

  const postData = {
    tellos_key: key,
    tellos_value: value
  };

  const options = {
    hostname: process.env.SCRIPT_SAVE_API_BASE_URL,
    path: '/tellos/tellos_api.php',
    method: 'POST',
    data:postData,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(postData).length
    }
  };

  const req = http.request(options, resp => {
    resp.on('data', d => {
      console.log(d.toString());
    });
  });

  req.on('error', error => {
    console.error('Error:', error);
  });

  req.write(JSON.stringify(postData));
  req.end();
}


addUninstallWebhookHandler();