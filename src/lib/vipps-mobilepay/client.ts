import { Client } from "@vippsmobilepay/sdk";
import { VippsMobilePayConfig } from "./config";
import { Currency } from "@vippsmobilepay/sdk/script/generated_types/epayment/types.gen";

export class VippsMobilePayClient {
  private client: ReturnType<typeof Client>;
  private config: VippsMobilePayConfig;

  constructor(config: VippsMobilePayConfig) {
    this.config = config;
    this.client = Client({
      merchantSerialNumber: config.merchantSerialNumber,
      subscriptionKey: config.subscriptionKey,
      useTestMode: config.testMode,
      retryRequests: true,
    });
  }

  async getToken() {
    const response = await this.client.auth.getToken(
      this.config.clientId,
      this.config.clientSecret
    );
    if (!response.ok) {
      throw new Error("Failed to get auth token");
    }
    return response.data.access_token;
  }

  async createPayment({
    amount,
    currency,
    orderId,
    returnUrl,
    description,
  }: {
    amount: number;
    currency: Currency;
    orderId: string;
    returnUrl: string;
    description: string;
  }) {
    const token = await this.getToken();

    const response = await this.client.payment.create(token, {
      amount: {
        currency,
        value: amount, // Amount in minor units (cents)
      },
      paymentMethod: { type: "WALLET" },
      reference: orderId,
      returnUrl,
      userFlow: "WEB_REDIRECT",
      paymentDescription: description,
    });

    if (!response.ok) {
      throw new Error("Failed to create payment");
    }

    return response.data;
  }

  async capturePayment(token: string, reference: string, amount: number, currency: Currency) {
    const response = await this.client.payment.capture(token, reference, {
      modificationAmount: {
        currency,
        value: amount,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to capture payment");
    }

    return response.data;
  }

  async refundPayment(token: string, reference: string, amount: number, currency: Currency) {
    const response = await this.client.payment.refund(token, reference, {
      modificationAmount: {
        currency,
        value: amount,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refund payment");
    }

    return response.data;
  }

  async cancelPayment(token: string, reference: string) {
    const response = await this.client.payment.cancel(token, reference);

    if (!response.ok) {
      throw new Error("Failed to cancel payment");
    }

    return response.data;
  }

  async getPaymentInfo(token: string, reference: string) {
    const response = await this.client.payment.info(token, reference);

    if (!response.ok) {
      throw new Error("Failed to get payment info");
    }

    return response.data;
  }
}
