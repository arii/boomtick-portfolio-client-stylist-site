import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({
  url: "http://localhost:4001/graphql",
  token: "bd633d1a46b5dbcb1a9f2a152b90ec2d23d9b90a",
  queries,
});
export default client;
