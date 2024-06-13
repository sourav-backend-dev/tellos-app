import { DeliveryMethod } from "@shopify/shopify-api";
import crypto from 'crypto';
import 'dotenv/config';
import http from 'http';

async function verifyShopifyWebhooks(req, res, next) {

  const hmac = req.query.hmac;

  if (!hmac) {
    return res.status(401).send("Webhook must originate from Shopify!");
  }
  const genHash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(JSON.stringify(req.body))
    .digest("base64");

  if (genHash !== hmac) {
    return res.status(401).send("Couldn't verify incoming Webhook request!");
  }

next();

}

export default {
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks/app-uninstall",
    callback: async (topic, shop) => {
      // Make HTTP request to the specified API endpoint
      try {
          const response = await fetch(process.env.TELLOS_API_BASE_URL+`shopify/uninstall?shop=${shop}`);
          if (!response.ok) {
            throw new Error('Failed to hit the API endpoint');
          }
        } catch (error) {
          console.error("Error hitting API endpoint:", error);
        }
    },
  },
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    verifyShopifyWebhooks,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Received customer data request webhook:", payload);
      res.sendStatus(200);
    },
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    verifyShopifyWebhooks,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Received customer data redact webhook:", payload);
      res.sendStatus(200);
    },
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    verifyShopifyWebhooks,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Received shop data redact webhook:", payload);
      res.sendStatus(200);
    },
  },
};
