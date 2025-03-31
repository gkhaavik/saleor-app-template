import { NextApiRequest, NextApiResponse } from "next";
import { VippsMobilePayClient } from "../../../lib/vipps-mobilepay/client";
import { getActiveConfiguration } from "../../../lib/vipps-mobilepay/config-manager";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reference } = req.query;

  if (!reference || typeof reference !== "string") {
    return res.status(400).json({
      error: {
        message: "Missing payment reference",
      },
    });
  }

  try {
    // Get the configuration from the first available instance
    // This is a simplification - in a real app, you'd need to match the configuration to the correct instance
    const configs = await getActiveConfiguration(
      process.env.SALEOR_API_URL!,
      process.env.SALEOR_APP_TOKEN!
    );
    if (!configs) {
      return res.status(400).json({
        error: {
          message: "No active Vipps MobilePay configuration found",
        },
      });
    }

    const client = new VippsMobilePayClient(configs);
    const token = await client.getToken();
    const paymentInfo = await client.getPaymentInfo(token, reference);

    if (!paymentInfo) {
      throw new Error("Failed to get payment info");
    }

    // Redirect back to the checkout with the payment status
    // The exact URL structure would depend on your Saleor storefront implementation
    const checkoutUrl = new URL(process.env.STOREFRONT_URL + "/checkout");
    checkoutUrl.searchParams.set("payment_status", paymentInfo.state);
    checkoutUrl.searchParams.set("reference", reference);

    res.redirect(checkoutUrl.toString());
  } catch (error) {
    console.error("Failed to handle payment return:", error);
    res.status(500).json({
      error: {
        message: "Failed to handle payment return",
      },
    });
  }
}
