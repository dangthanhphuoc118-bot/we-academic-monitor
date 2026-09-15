declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BOOTSTRAP_ADMIN_EMAIL?: string;
    BOOTSTRAP_ADMIN_PIN?: string;
  }
}
