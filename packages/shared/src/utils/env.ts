type CloudflareEnv = { env: Record<string, string> };

/*
 * https://remix.run/blog/remix-vite-stable#cloudflare-pages-support
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasCloudflareProxyContext = (context: any): context is { cloudflare: CloudflareEnv } => {
  return !!context?.cloudflare?.env;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasCloudflareContext = (context: any): context is CloudflareEnv => {
  return !!context?.env;
};

/**
 *
 * Utility function to get env variables across Node and Edge runtimes.
 *
 * @param name Pass the name of the environment variable. The param is case-sensitive.
 * @returns string Returns the value of the environment variable if exists.
 */
export const getEnvVariable = (name: string, context?: unknown): string => {
  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name] as string;
  }

  /*
   * Remix + Cloudflare pages
   * if (typeof (context?.cloudflare as CloudflareEnv)?.env !== 'undefined') {
   */
  if (hasCloudflareProxyContext(context)) {
    return context.cloudflare.env[name] || '';
  }

  // Cloudflare
  if (hasCloudflareContext(context)) {
    return context.env[name] || '';
  }

  // Check whether the value exists in the context object directly
  if (context && typeof context[name as keyof typeof context] === 'string') {
    return context[name as keyof typeof context] as string;
  }

  // Cloudflare workers
  try {
    return globalThis[name as keyof typeof globalThis];
  } catch (_) {
    // This will raise an error in Cloudflare Pages
  }

  return '';
};

export const isClerkEnabled = () =>
  (process.env.NOVU_ENTERPRISE === 'true' || process.env.CI_EE_TEST === 'true') && process.env.CLERK_ENABLED === 'true';
