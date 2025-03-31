import { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Input, Switch, Text } from "@saleor/macaw-ui";
import { VippsMobilePayConfig, VippsMobilePayConfigSchema } from "@/lib/vipps-mobilepay/config";

const AddConfigurationPage: NextPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VippsMobilePayConfig>({
    resolver: zodResolver(VippsMobilePayConfigSchema),
    defaultValues: {
      systemName: "saleor-app",
      systemVersion: "1.0.0",
      systemPluginName: "vipps-mobilepay",
      systemPluginVersion: "1.0.0",
      testMode: true,
    },
  });

  const onSubmit = async (data: VippsMobilePayConfig) => {
    try {
      const response = await fetch("/api/configurations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      router.push("/configurations/list");
    } catch (error) {
      console.error("Failed to save configuration:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={4} padding={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text as="h1">Add Vipps MobilePay Configuration</Text>
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
            <Button variant="tertiary" onClick={() => router.push("/configurations/list")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              Save Configuration
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default AddConfigurationPage;
