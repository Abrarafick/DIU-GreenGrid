import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  compileSustainabilityReportBundle,
  generateSustainabilityCsv,
  generateSustainabilityExcel,
} from "@/lib/sustainability/reporting";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "excel";
    const reportType = url.searchParams.get("report") || "all";

    const [metrics, buildings, targets, actions] = await Promise.all([
      db.energyMetric.findMany({ orderBy: { timestamp: "asc" } }),
      db.building.findMany(),
      db.sustainabilityTarget.findMany({ orderBy: { createdAt: "asc" } }),
      db.actionImprovement.findMany({
        include: { targetBuilding: true },
        orderBy: { reportedAt: "desc" },
      }),
    ]);

    const bundle = compileSustainabilityReportBundle({
      metrics,
      buildings,
      targets,
      actions,
      periodLabel: "November 2026 Comprehensive Operational Audit",
    });

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format.toLowerCase() === "csv") {
      const csvContent = generateSustainabilityCsv(bundle, reportType);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="DIU_GreenGrid_Report_${reportType}_${timestamp}.csv"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // Default: Excel workbook
    const excelBuffer = generateSustainabilityExcel(bundle);
    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="DIU_GreenGrid_Sustainability_Report_${timestamp}.xlsx"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to generate report export" }, { status: 500 });
  }
}
