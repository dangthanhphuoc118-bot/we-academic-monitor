import { defineConfig } from "vite";
import vinext from "vinext";

const LOCAL_DATABASE_ID = "00000000-0000-4000-8000-000000000000";

export default defineConfig(async () => {
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          main: "vinext/server/fetch-handler",
          compatibility_date: "2026-09-14",
          compatibility_flags: ["nodejs_compat"],
          d1_databases: [
            {
              binding: "DB",
              database_name: "we-academic-monitor-db",
              database_id: LOCAL_DATABASE_ID,
            },
          ],
        },
      }),
    ],
  };
});
