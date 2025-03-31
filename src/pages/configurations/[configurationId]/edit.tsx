import { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useEffect, useState } from "react";
import { Box, Button, Input, Switch, Text } from "@saleor/macaw-ui";
import { VippsMobilePayConfig, VippsMobilePayConfigSchema } from "@/lib/vipps-mobilepay/config";

const EditConfigurationPage: NextPage = () => {
  const router = useRouter();
  const { configurationId } = router.query;
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VippsMobilePayConfig>({
    resolver: zodResolver(VippsMobilePayConfigSchema),
  });

  useEffect(() => {
    const fetchConfiguration = async () => {
      if (!configurationId || typeof configurationId !== "string") {
        return;
      }

      try {
        const response = await fetch(`/api/configurations/${configurationId}`);
        const data = await response.json();
        reset(data);
      } catch (error) {
        console.error("Failed to fetch configuration:", error);
        router.push("/configurations/list");
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguration();
  }, [configurationId, reset, router]);

  const onSubmit = async (data: VippsMobilePayConfig) => {
    if (!configurationId || typeof configurationId !== "string") {
      return;
    }

    try {
      const response = await fetch(`/api/configurations/${configurationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update configuration");
      }

      router.push("/configurations/list");
    } catch (error) {
      console.error("Failed to update configuration:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = async () => {
    if (!configurationId || typeof configurationId !== "string") {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      const response = await fetch(`/api/configurations/${configurationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete configuration");
      }

      router.push("/configurations/list");
    } catch (error) {
      console.error("Failed to delete configuration:", error);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return (
      <Box>
        <Text>Loading configuration...</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={4} padding={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text>Edit Vipps MobilePay Configuration</Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={4}>
          <Box>
            <Input
              label="Merchant Serial Number"
              {...register("merchantSerialNumber")}
              error={!!errors.merchantSerialNumber}
              helperText={errors.merchantSerialNumber?.message}
              placeholder="Enter your merchant serial number"
            />
          </Box>

          <Box>
            <Input
              label="Subscription Key"
              {...register("subscriptionKey")}
              error={!!errors.subscriptionKey}
              helperText={errors.subscriptionKey?.message}
              placeholder="Enter your subscription key"
              type="password"
            />
          </Box>

          <Box>
            <Input
              label="Client ID"
              {...register("clientId")}
              error={!!errors.clientId}
              helperText={errors.clientId?.message}
              placeholder="Enter your client ID"
            />
          </Box>

          <Box>
            <Input
              label="Client Secret"
              {...register("clientSecret")}
              error={!!errors.clientSecret}
              helperText={errors.clientSecret?.message}
              placeholder="Enter your client secret"
              type="password"
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Switch label="Test Mode" {...register("testMode")}>
              <Switch.Item id="testMode-true" value="true">
                Test
              </Switch.Item>
              <Switch.Item id="testMode-false" value="false">
                Live
              </Switch.Item>
            </Switch>
          </Box>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="error" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="tertiary" onClick={() => router.push("/configurations/list")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              Update Configuration
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default EditConfigurationPage;
