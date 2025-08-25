/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Client-side environment variables go here (with VITE_ prefix)
  readonly NODE_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
