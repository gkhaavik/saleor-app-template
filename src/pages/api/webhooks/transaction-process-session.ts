import {
  TransactionProcessSessionDocument,
  TransactionProcessSessionPayloadFragment,
} from "../../../../generated/graphql"; // Import the generated payload type
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";

export const transactionProcessSessionWebhook =
  new SaleorSyncWebhook<TransactionProcessSessionPayloadFragment>({
    name: "Transaction Process Session",
    webhookPath: "/api/webhooks/transaction-process-session",
    event: "TRANSACTION_PROCESS_SESSION",
    apl: saleorApp.apl,
    query: TransactionProcessSessionDocument,
  });

export default transactionProcessSessionWebhook.createHandler((req, res, ctx) => {
  const { payload, event, baseUrl, authData } = ctx;

  console.log("Transaction Process Session payload:", payload);

  try {
    // doSomethingThatCanFail(); // This function can throw an error
    const pspReference = crypto.randomUUID();

    return res.status(200).json({
      result: "CHARGE_SUCCESS",
      amount: payload.action.amount,
      pspReference,
    });
  } catch (error) {
    return res.status(200).json({
      result: "CHARGE_FAILURE",
      amount: payload.action.amount,
      pspReference: crypto.randomUUID(),
    });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};
