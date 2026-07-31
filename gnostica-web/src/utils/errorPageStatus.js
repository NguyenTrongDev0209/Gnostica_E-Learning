const RETRYABLE_STATUSES = new Set([500, 502, 503]);

export function getErrorPageStatus(error) {
  const status = error?.response?.status;

  if ([401, 403, 404].includes(status)) {
    return 404;
  }

  if (RETRYABLE_STATUSES.has(status)) {
    return status;
  }

  return status ? 500 : 503;
}
