import { client as defaultClient } from "../../tina/__generated__/client";
import { createClient } from "tinacms/dist/client";
import { queries } from "../../tina/__generated__/types.js";

const clientId =
  (typeof process !== "undefined"
    ? process.env?.VITE_TINA_CLIENT_ID
    : undefined) ||
  import.meta.env?.VITE_TINA_CLIENT_ID ||
  null;

const token =
  (typeof process !== "undefined" ? process.env?.TINA_TOKEN : undefined) ||
  import.meta.env?.TINA_TOKEN ||
  import.meta.env?.VITE_TINA_TOKEN ||
  null;

const branch =
  (typeof process !== "undefined"
    ? process.env?.VITE_TINA_BRANCH
    : undefined) ||
  import.meta.env?.VITE_TINA_BRANCH ||
  "main";

const isDev = Boolean(import.meta.env?.DEV);

/**
 * Unified TinaCMS Content API Client
 * - In local development: uses defaultClient (http://localhost:4001/graphql)
 * - In production: uses TinaCloud endpoint if clientId and token are configured, otherwise falls back to defaultClient
 */
export const tinaClient =
  !isDev && clientId && token
    ? createClient({
        url: `https://content.tinajs.io/content/${clientId}/github/${branch}`,
        token,
        queries,
      })
    : defaultClient;
