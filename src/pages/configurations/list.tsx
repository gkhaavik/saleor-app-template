import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, Button, List, Text } from "@saleor/macaw-ui";
import { VippsMobilePayConfig } from "@/lib/vipps-mobilepay/config";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";

const ConfigurationListPage: NextPage = () => {
  const [configurations, setConfigurations] = useState<VippsMobilePayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { appBridgeState } = useAppBridge();

  useEffect(() => {
    if (!appBridgeState?.ready) {
      return;
    }

    const fetchConfigurations = async () => {
      try {
        const response = await fetch("/api/configurations");
        const data = await response.json();
        setConfigurations(data);
      } catch (error) {
        console.error("Failed to fetch configurations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigurations();
  }, [appBridgeState?.ready]);

  // Don't render anything until AppBridge is ready
  if (!appBridgeState?.ready) {
    return null;
  }

  if (loading) {
    return (
      <Box padding={4}>
        <Text>Loading configurations...</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={4} padding={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text as="h1" size={5}>
          Vipps MobilePay Configurations
        </Text>
        <Button variant="primary" onClick={() => router.push("/configurations/add")}>
          Add Configuration
        </Button>
      </Box>

      {configurations.length === 0 ? (
        <Box padding={4} textAlign="center">
          <Text color="default2">No configurations found. Click the button above to add one.</Text>
        </Box>
      ) : (
        <List>
          {configurations.map((config, index) => (
            <List.Item key={index}>
              <Button
                variant="tertiary"
                onClick={() => router.push(`/configurations/${index}/edit`)}
              >
                <Text>
                  {config.systemName} - {config.systemPluginName} - {config.systemPluginVersion}
                </Text>
              </Button>
            </List.Item>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ConfigurationListPage;
