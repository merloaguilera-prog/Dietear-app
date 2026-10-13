const DIRECT_ENDPOINT = "https://api.openai.com/v1/responses";
const GATEWAY_ENDPOINT = "https://ai-gateway.vercel.sh/v1/responses";

export function getAIRuntime() {
  const openAIKey = process.env.OPENAI_API_KEY?.trim();
  if (openAIKey) {
    return {
      endpoint: DIRECT_ENDPOINT,
      token: openAIKey,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
    };
  }

  const gatewayToken =
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.VERCEL_OIDC_TOKEN?.trim();

  if (gatewayToken) {
    return {
      endpoint: GATEWAY_ENDPOINT,
      token: gatewayToken,
      model: process.env.AI_GATEWAY_MODEL?.trim() || "openai/gpt-5.4-mini",
    };
  }

  return null;
}
