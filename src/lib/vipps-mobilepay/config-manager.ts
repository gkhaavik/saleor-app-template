import { saleorApp } from "../../saleor-app";
import { VippsMobilePayConfig } from "./config";
import { Client, createClient, cacheExchange, fetchExchange } from "@urql/core";
import { MetadataManager, MetadataEntry } from "@saleor/app-sdk/settings-manager";

const VIPPS_MOBILEPAY_CONFIG_KEY = "vipps-mobilepay-config";

const createMetadataManager = (client: Client) => {
  return new MetadataManager({
    fetchMetadata: async () => {
      const { data } = await client
        .query(
          `
          query FetchAppMetadata {
            app {
              privateMetadata {
                key
                value
              }
            }
          }
        `,
          {}
        )
        .toPromise();

      return (
        data?.app?.privateMetadata.map((md: { key: string; value: string }) => ({
          key: md.key,
          value: md.value,
        })) || []
      );
    },
    mutateMetadata: async (metadata: MetadataEntry[]) => {
      const { data } = await client
        .mutation(
          `
          mutation UpdateAppMetadata($input: [MetadataInput!]!) {
            updatePrivateMetadata(input: $input) {
              item {
                privateMetadata {
                  key
                  value
                }
              }
            }
          }
        `,
          { input: metadata }
        )
        .toPromise();

      return (
        data?.updatePrivateMetadata?.item?.privateMetadata.map(
          (md: { key: string; value: string }) => ({
            key: md.key,
            value: md.value,
          })
        ) || []
      );
    },
    deleteMetadata: async (keys: string[]) => {
      await client
        .mutation(
          `
          mutation DeleteMetadata($keys: [String!]!) {
            deletePrivateMetadata(keys: $keys) {
              item {
                privateMetadata {
                  key
                  value
                }
              }
            }
          }
        `,
          { keys }
        )
        .toPromise();
    },
  });
};

const createUrqlClient = (saleorApiUrl: string, token: string): Client =>
  createClient({
    url: saleorApiUrl,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

export const getActiveConfiguration = async (
  saleorApiUrl: string,
  token: string
): Promise<VippsMobilePayConfig | null> => {
  const authData = await saleorApp.apl.get(saleorApiUrl);
  if (!authData) {
    return null;
  }

  const client = createUrqlClient(saleorApiUrl, authData.token);
  const settings = createMetadataManager(client);
  const value = await settings.get(VIPPS_MOBILEPAY_CONFIG_KEY);

  return value ? (JSON.parse(value) as VippsMobilePayConfig) : null;
};

export const saveConfiguration = async (
  saleorApiUrl: string,
  token: string,
  config: VippsMobilePayConfig
): Promise<void> => {
  const authData = await saleorApp.apl.get(saleorApiUrl);
  if (!authData) {
    throw new Error("No auth data found");
  }

  const client = createUrqlClient(saleorApiUrl, authData.token);
  const settings = createMetadataManager(client);
  await settings.set({
    key: VIPPS_MOBILEPAY_CONFIG_KEY,
    value: JSON.stringify(config),
  });
};
