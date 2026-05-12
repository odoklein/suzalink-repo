import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_ENDPOINT_LENGTH = 500;
const MAX_METHOD_LENGTH = 10;
const METRICS_ENDPOINT = "/api/manager/api-keys/metrics";

function startOfUtcDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function normalizeEndpoint(pathname: string): string {
  return pathname.substring(0, MAX_ENDPOINT_LENGTH);
}

export async function logApiRequestMetric(
  request: NextRequest,
  statusCode: number,
): Promise<void> {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api/") || pathname === METRICS_ENDPOINT) {
    return;
  }

  const date = startOfUtcDay();
  const endpoint = normalizeEndpoint(pathname);
  const method = request.method.substring(0, MAX_METHOD_LENGTH);
  const now = new Date();

  try {
    await prisma.apiRequestDailyMetric.upsert({
      where: {
        date_endpoint_method_statusCode: {
          date,
          endpoint,
          method,
          statusCode,
        },
      },
      create: {
        date,
        endpoint,
        method,
        statusCode,
        count: 1,
        lastSeenAt: now,
      },
      update: {
        count: { increment: 1 },
        lastSeenAt: now,
      },
    });
  } catch (error) {
    console.error("Failed to log API request metric:", error);
  }
}

export async function getTodayApiRequestSummary() {
  const today = startOfUtcDay();

  const rows = await prisma.apiRequestDailyMetric.findMany({
    where: { date: today },
    orderBy: { count: "desc" },
  });

  const totalCalls = rows.reduce((sum, row) => sum + row.count, 0);
  const failedCalls = rows
    .filter((row) => row.statusCode >= 400)
    .reduce((sum, row) => sum + row.count, 0);

  const endpointTotals = new Map<string, { endpoint: string; method: string; count: number }>();
  for (const row of rows) {
    const key = `${row.method} ${row.endpoint}`;
    const existing = endpointTotals.get(key);
    if (existing) {
      existing.count += row.count;
    } else {
      endpointTotals.set(key, {
        endpoint: row.endpoint,
        method: row.method,
        count: row.count,
      });
    }
  }

  return {
    date: today.toISOString().slice(0, 10),
    totalCalls,
    failedCalls,
    topEndpoints: Array.from(endpointTotals.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    failedRequests: rows
      .filter((row) => row.statusCode >= 400)
      .slice(0, 5)
      .map((row) => ({
        endpoint: row.endpoint,
        method: row.method,
        statusCode: row.statusCode,
        count: row.count,
      })),
  };
}
