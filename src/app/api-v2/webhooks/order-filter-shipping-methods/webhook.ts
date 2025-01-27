import { gql } from "urql";
import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";
import { OrderFilterShippingMethodsPayloadFragment } from "../../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";

const OrderFilterShippingMethodsPayload = gql`
  fragment OrderFilterShippingMethodsPayload on OrderFilterShippingMethods {
    order {
      deliveryMethod {
        ... on ShippingMethod {
          id
          name
        }
      }
    }
  }
`;

const OrderFilterShippingMethodsSubscription = gql`
  ${OrderFilterShippingMethodsPayload}
  subscription OrderFilterShippingMethods {
    event {
      ...OrderFilterShippingMethodsPayload
    }
  }
`;

export const orderFilterShippingMethodsWebhook =
  new SaleorSyncWebhook<OrderFilterShippingMethodsPayloadFragment>({
    name: "Order Filter Shipping Methods",
    webhookPath: "api-v2/webhooks/order-filter-shipping-methods",
    event: "ORDER_FILTER_SHIPPING_METHODS",
    apl: saleorApp.apl,
    query: OrderFilterShippingMethodsSubscription,
  });
