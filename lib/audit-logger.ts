/**
 * Audit logging functionality for security events
 */
import prisma from "@/lib/prisma"

interface SecurityEventInput {
  type: string
  userId: string
  details: string
  ip: string
  userAgent?: string
}

export async function logSecurityEvent(event: SecurityEventInput) {
  try {
    // Log to database
    const logEntry = await prisma.securityLog.create({
      data: {
        type: event.type,
        userId: event.userId,
        details: event.details,
        ipAddress: event.ip,
        userAgent: event.userAgent || "Unknown",
      },
    })

    // In a real app, you would also send critical events to a monitoring service
    console.log(
      `[SECURITY_AUDIT] ${new Date().toISOString()} | ${event.type} | User: ${event.userId} | ${event.details} | IP: ${event.ip}`,
    )

    // For critical events, you might want to trigger alerts
    if (
      event.type === "BRUTE_FORCE_ATTEMPT" ||
      event.type === "RATE_LIMIT_EXCEEDED" ||
      event.type === "SUSPICIOUS_ACTIVITY"
    ) {
      // In a real app, this would trigger an alert to security team
      console.warn(`[SECURITY_ALERT] Potential security threat detected: ${event.type} for user ${event.userId}`)
    }

    return logEntry
  } catch (error) {
    console.error("Error logging security event:", error)
    // Fallback to console logging if database logging fails
    console.log(
      `[SECURITY_AUDIT_FALLBACK] ${new Date().toISOString()} | ${event.type} | User: ${event.userId} | ${event.details} | IP: ${event.ip}`,
    )
  }
}

export async function getSecurityLogs(userId?: string) {
  try {
    const where = userId ? { userId } : {}

    return await prisma.securityLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error retrieving security logs:", error)
    return []
  }
}

