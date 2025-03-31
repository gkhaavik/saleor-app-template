import {
  TransactionProcessSessionDocument,
  TransactionProcessSessionPayloadFragment,
} from "../../../../generated/graphql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { VippsMobilePayClient } from "../../../lib/vipps-mobilepay/client";
import { getActiveConfiguration } from "../../../lib/vipps-mobilepay/config-manager";

export const transactionProcessSessionWebhook =
  new SaleorSyncWebhook<TransactionProcessSessionPayloadFragment>({
    name: "Transaction Process Session",
    webhookPath: "/api/webhooks/transaction-process-session",
    event: "TRANSACTION_PROCESS_SESSION",
    apl: saleorApp.apl,
    query: TransactionProcessSessionDocument,
  });

export default transactionProcessSessionWebhook.createHandler(async (req, res, ctx) => {
  const { payload, event, baseUrl, authData } = ctx;
  const { action, transaction } = payload;

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
    const token = await client.getToken();

    // The payment reference from the initialize session
    const { pspReference } = transaction;

    // Convert Saleor currency to Vipps MobilePay currency
    const currency = action.currency.toUpperCase() as "NOK" | "DKK" | "EUR";
    if (!["NOK", "DKK", "EUR"].includes(currency)) {
      return res.status(400).json({
        error: {
          message: "Unsupported currency. Only NOK, DKK, and EUR are supported.",
        },
      });
    }

    // Get the current payment status
    const paymentInfo = await client.getPaymentInfo(token, pspReference);

    // If the payment is authorized and we need to capture
    if (paymentInfo.state === "AUTHORIZED" && action.actionType === "CHARGE") {
      await client.capturePayment(
        token,
        pspReference,
        Math.round(action.amount * 100), // Convert to minor units
        currency
      );
    }

    return res.json({
      data: {
        pspReference: paymentInfo.pspReference,
        result: paymentInfo.state,
      },
    });
  } catch (error) {
    console.error("Failed to process Vipps MobilePay payment:", error);
    return res.status(500).json({
      error: {
        message: "Failed to process payment",
      },
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};
