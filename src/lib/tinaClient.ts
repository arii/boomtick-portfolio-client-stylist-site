import { client as defaultClient } from "../../tina/__generated__/client";
import { createClient } from "tinacms/dist/client";
import { queries } from "../../tina/__generated__/types.js";

const clientId =
  (typeof process !== "undefined" ? process.env?.VITE_TINA_CLIENT_ID : undefined) ||
  import.meta.env?.VITE_TINA_CLIENT_ID ||
  null;

const token =
  (typeof process !== "undefined" ? process.env?.TINA_TOKEN : undefined) ||
  import.meta.env?.TINA_TOKEN ||
  import.meta.env?.VITE_TINA_TOKEN ||
  null;

const branch =
  (typeof process !== "undefined" ? process.env?.VITE_TINA_BRANCH : undefined) ||
  import.meta.env?.VITE_TINA_BRANCH ||
  "main";

/**
 * Unified TinaCMS Content API Client
 * - When running in production with TinaCloud credentials: uses TinaCloud endpoint
 * - When running locally: uses local GraphQL endpoint (http://localhost:4001/graphql)
 */
export const tinaClient =
  clientId && token
    ? createClient({
        url: `https://content.tinajs.io/content/${clientId}/github/${branch}`,
        token,
        queries,
      })
    : defaultClient;

export default tinaClient;
