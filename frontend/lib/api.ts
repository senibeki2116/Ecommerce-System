const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function getServiceUrl(
  configuredUrl: string | undefined,
  fallbackUrl: string,
): string {
  const serviceUrl = new URL(configuredUrl || fallbackUrl);

  if (
    typeof window !== "undefined" &&
    LOOPBACK_HOSTS.has(serviceUrl.hostname) &&
    !LOOPBACK_HOSTS.has(window.location.hostname)
  ) {
    serviceUrl.hostname = window.location.hostname;
  }

  return serviceUrl.toString().replace(/\/$/, "");
}

export function getApiUrl(): string {
  return getServiceUrl(
    process.env.NEXT_PUBLIC_API_URL,
    "http://localhost:3001",
  );
}
