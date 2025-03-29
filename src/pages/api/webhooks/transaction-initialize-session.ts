import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionInitializeSessionDocument,
  TransactionInitializeSessionPayloadFragment,
} from "generated/graphql";

export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionPayloadFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "/api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionDocument,
  });

export default transactionInitializeSessionWebhook.createHandler((req, res, ctx) => {
  const { payload, event, baseUrl, authData } = ctx;

  console.log("Transaction Initialize Session payload:", payload);

  const randomPspReference = crypto.randomUUID();

  return res.status(200).json({
    result: "CHARGE_ACTION_REQUIRED",
    amount: payload.action.amount,
    pspReference: randomPspReference,
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};
