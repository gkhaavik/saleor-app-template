import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z
  .object({
    saleorUrl: z.string().url(),
  })
  .required();
type FormValues = z.infer<typeof schema>;

const AddToSaleorForm = () => {
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      saleorUrl: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = formMethods;

  return (
    <FormProvider {...formMethods}>
      <form
        method="post"
        noValidate
        onSubmit={handleSubmit((values) => {
          const manifestUrl = new URL("/api/manifest", window.location.origin).toString();
          const redirectUrl = new URL(
            `/dashboard/apps/install?manifestUrl=${manifestUrl}`,
            values.saleorUrl
          ).toString();

          window.open(redirectUrl, "_blank");
        })}
      >
        <Box display="flex" flexDirection="column" gap={2} marginTop={10}>
          <Controller
            name="saleorUrl"
            control={control}
            render={({ field }) => (
              <Input
                inputMode="url"
                label="Saleor URL"
                required
                size="medium"
                placeholder="https://…"
                error={!!errors.saleorUrl}
                helperText={errors.saleorUrl?.message || " "}
                {...field}
              />
            )}
          />

          <Button type="submit" size="large" disabled={isSubmitting}>
            Add to Saleor
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

const CopyManifest = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsetCopied = () => {
      setCopied(false);
    };

    if (copied) {
      setTimeout(unsetCopied, 1750);
    }
  }, [copied]);

  const handleClick = async () => {
    await navigator.clipboard.writeText(window.location.origin + "/api/manifest");
    setCopied(true);
  };

  return (
    <Button variant="secondary" onClick={() => void handleClick()}>
      {copied ? "Copied" : "Copy app manifest URL"}
    </Button>
  );
};

const IndexPage: NextPage = () => {
  console.log("IndexPage");

  const { appBridgeState } = useAppBridge();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    console.log("appBridgeState", appBridgeState);
  }, []);

  if (!mounted) {
    return null;
  }

  if (appBridgeState?.ready && mounted) {
    void router.replace("/configurations/list");
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap={2} __maxWidth="45rem">
      <Text as="h1" size={8}>
        Welcome to Vipps MobilePay App!{" "}
        <span role="img" aria-label="wave">
          👋
        </span>
      </Text>
      <Text as="p">This app allows you to integrate Vipps MobilePay with your Saleor store.</Text>

      {!appBridgeState?.ready && (
        <div>
          <Text as="strong">Install this app in your Saleor Dashboard to proceed!</Text>
          {mounted && <AddToSaleorForm />}
        </div>
      )}

      <CopyManifest />
    </Box>
  );
};

export default IndexPage;
