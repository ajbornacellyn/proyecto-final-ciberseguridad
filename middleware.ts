import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting maps
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>()
const IP_RATE_LIMIT = 100 // requests per minute

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
  )

  // Implement basic rate limiting
  const ip = request.ip || "127.0.0.1"

  // Get current count for this IP
  const currentTime = Date.now()
  const ipData = ipRequestCounts.get(ip) || { count: 0, timestamp: currentTime }

  // Reset count if it's been more than a minute
  if (currentTime - ipData.timestamp > 60000) {
    ipData.count = 0
    ipData.timestamp = currentTime
  }

  // Increment request count
  ipData.count++
  ipRequestCounts.set(ip, ipData)

  // Check if rate limit exceeded
  if (ipData.count > IP_RATE_LIMIT) {
    console.log(`[SECURITY] Rate limit exceeded for IP: ${ip}`)
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", IP_RATE_LIMIT.toString())
  response.headers.set("X-RateLimit-Remaining", Math.max(0, IP_RATE_LIMIT - ipData.count).toString())

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

