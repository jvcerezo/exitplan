export function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function createOfflineId(prefix: string) {
  return `local-${prefix}-${crypto.randomUUID()}`;
}

export function isOfflineId(value: string | null | undefined) {
  return Boolean(value && value.startsWith("local-"));
}
