import { NextResponse } from "next/server";
import { generateCsvTemplate, INGESTION_TEMPLATES } from "@/lib/ingestion/templates";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const template = INGESTION_TEMPLATES[type] || INGESTION_TEMPLATES.unified_multi_source;
  const csvContent = generateCsvTemplate(type);

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${template.filename}"`,
    },
  });
}
