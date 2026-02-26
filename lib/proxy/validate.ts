import { resolve } from "dns/promises"
import { isIP } from "net"

const BLOCKED_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^fd/i,
]

const BLOCKED_HOSTNAMES = [
  "metadata.google.internal",
  "metadata.goog",
  "169.254.169.254",
]

function isPrivateIP(ip: string): boolean {
  return BLOCKED_IP_RANGES.some((range) => range.test(ip))
}

export type ValidationResult =
  | { ok: true; url: URL }
  | { ok: false; error: string }

export async function validateUrl(raw: string): Promise<ValidationResult> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { ok: false, error: "Invalid URL" }
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Only HTTP and HTTPS protocols are allowed" }
  }

  const hostname = url.hostname

  if (BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) {
    return { ok: false, error: "This host is not allowed" }
  }

  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      return { ok: false, error: "Requests to private IP addresses are not allowed" }
    }
    return { ok: true, url }
  }

  // Resolve DNS to check for private IPs (prevent DNS rebinding)
  try {
    const addresses = await resolve(hostname)
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return { ok: false, error: "This host resolves to a private IP address" }
      }
    }
  } catch {
    return { ok: false, error: "Could not resolve hostname" }
  }

  return { ok: true, url }
}

// Simple in-memory rate limiter
const requests = new Map<string, number[]>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = requests.get(ip) ?? []

  // Remove expired entries
  const valid = timestamps.filter((t) => now - t < RATE_WINDOW_MS)

  if (valid.length >= RATE_LIMIT) {
    requests.set(ip, valid)
    return false
  }

  valid.push(now)
  requests.set(ip, valid)
  return true
}

// Periodically clean up stale entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, timestamps] of requests) {
      const valid = timestamps.filter((t) => now - t < RATE_WINDOW_MS)
      if (valid.length === 0) {
        requests.delete(ip)
      } else {
        requests.set(ip, valid)
      }
    }
  }, RATE_WINDOW_MS)
}
