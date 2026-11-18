/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly IFFR_METRICS_API_URL?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_CLERK_PROXY_URL?: string;
  readonly VITE_POCKETSFLOW_API_KEY?: string;
  readonly VITE_POCKETSFLOW_SUCCESS_URL?: string;
  readonly VITE_POCKETSFLOW_CANCEL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
