import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "30", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const buildingId = searchParams.get("buildingId") || undefined;
    const energySourceId = searchParams.get("energySourceId") || undefined;
    const isSimulatedParam = searchParams.get("isSimulated");

    const where: any = {};
    if (buildingId) where.buildingId = buildingId;
    if (energySourceId) where.energySourceId = energySourceId;
    if (isSimulatedParam === "true") where.isSimulated = true;
    if (isSimulatedParam === "false") where.isSimulated = false;

    const [total, readings] = await Promise.all([
      db.energyMetric.count({ where }),
      db.energyMetric.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { timestamp: "desc" },
        include: {
          building: true,
          energySource: true,
          provenance: true,
          batch: true,
        },
      }),
    ]);

    return NextResponse.json({
      total,
      limit,
      offset,
      readings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 });
  }
}
