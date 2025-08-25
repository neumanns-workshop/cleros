/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RANDOMORG_API_KEY?: string
  readonly RANDOMORG_API_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
