import type { Config, Context } from "@netlify/edge-functions";

export default (_request: Request, context: Context) => context.next();

export const config: Config = {
  path: "/api/enquiry",
  method: "POST",
  rateLimit: {
    action: "rate_limit",
    aggregateBy: ["domain", "ip"],
    windowLimit: 5,
    windowSize: 600,
  },
};
