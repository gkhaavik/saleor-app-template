import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionInitializeSessionDocument,
  TransactionInitializeSessionPayloadFragment,
} from "generated/graphql";
import { VippsMobilePayClient } from "../../../lib/vipps-mobilepay/client";
import { getActiveConfiguration } from "@/lib/vipps-mobilepay/config-manager";

export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionPayloadFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "/api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionDocument,
  });

export default transactionInitializeSessionWebhook.createHandler(async (req, res, ctx) => {
  const { payload, baseUrl, authData } = ctx;
  const { action, sourceObject } = payload;

  try {
    const config = await getActiveConfiguration(authData.saleorApiUrl, authData.token);
    if (!config) {
      return res.status(400).json({
        error: {
          message: "No active Vipps MobilePay configuration found",
        },
      });
    }

    const client = new VippsMobilePayClient(config);

    const returnUrl = new URL("/api/webhooks/transaction-return", baseUrl).toString();

    // Convert Saleor currency to Vipps MobilePay currency
    const currency = action.currency.toUpperCase() as "NOK" | "DKK" | "EUR";
    if (!["NOK", "DKK", "EUR"].includes(currency)) {
      return res.status(400).json({
        error: {
          message: "Unsupported currency. Only NOK, DKK, and EUR are supported.",
        },
      });
    }

    const payment = await client.createPayment({
      amount: Math.round(action.amount * 100), // Convert to minor units
      currency,
      orderId: sourceObject.id,
      returnUrl,
      description: `Payment for order ${sourceObject.id}`,
    });

    return res.json({
      data: {
        paymentData: payment,
        // This URL will be shown to the customer in Saleor's checkout
        redirectUrl: payment.redirectUrl,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Vipps MobilePay payment:", error);
    return res.status(500).json({
      error: {
        message: "Failed to initialize payment",
      },
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};
