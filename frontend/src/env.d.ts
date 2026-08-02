/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL every API call is prefixed with. Relative in dev (Vite proxy). */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
