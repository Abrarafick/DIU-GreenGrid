import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const batches = await db.ingestionBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        provenance: true,
      },
    });
    return NextResponse.json({ batches });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch import history" }, { status: 500 });
  }
}
