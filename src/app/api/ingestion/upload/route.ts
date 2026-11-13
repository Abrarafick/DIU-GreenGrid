import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseIngestionBuffer } from "@/lib/ingestion/parser";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isSimulatedForm = formData.get("isSimulated") === "true";
    const defaultBuildingId = (formData.get("buildingId") as string) || undefined;
    const defaultEnergySourceId = (formData.get("energySourceId") as string) || undefined;
    const customDescription = (formData.get("description") as string) || "File Batch Import";

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload" }, { status: 400 });
    }

    const filename = file.name;
    const isCsv = filename.toLowerCase().endsWith(".csv");
    const isExcel = filename.toLowerCase().endsWith(".xlsx") || filename.toLowerCase().endsWith(".xls");

    if (!isCsv && !isExcel) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a CSV (.csv) or Excel (.xlsx, .xls) spreadsheet." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Resolve or establish Provenance
    const provCode = isSimulatedForm ? "DEMO_SIMULATION_ENGINE" : "SUBMETER_CSV_IMPORT";
    let provenance = await db.dataSourceProvenance.findUnique({
      where: { code: provCode },
    });

    if (!provenance) {
      provenance = await db.dataSourceProvenance.create({
        data: {
          code: provCode,
          name: isSimulatedForm ? "Demonstration Simulation Engine" : "Facility CSV/Excel File Ingestor",
          ingestionMethod: isSimulatedForm ? "DEMO_SIMULATION" : "CSV_EXCEL_IMPORT",
          isSimulated: isSimulatedForm,
          confidenceRating: isSimulatedForm ? 0.0 : 0.95,
          sourceDetails: `Uploaded file: ${filename}`,
          description: "Batch import through the DIU GreenGrid ingestion portal.",
        },
      });
    }

    // 2. Parse & Validate Buffer
    const parseResult = await parseIngestionBuffer(
      buffer,
      isCsv ? "CSV" : "EXCEL",
      {
        provenanceId: provenance.id,
        defaultBuildingId,
        defaultEnergySourceId,
        isSimulated: isSimulatedForm,
      }
    );

    // 3. Create Ingestion Batch Record
    const batch = await db.ingestionBatch.create({
      data: {
        filename,
        fileType: isCsv ? "CSV" : "EXCEL",
        sourceType: isSimulatedForm ? "DEMO_SIMULATION" : "CSV_EXCEL_IMPORT",
        isSimulated: isSimulatedForm,
        totalRows: parseResult.totalRows,
        successfulRows: parseResult.acceptedRows.length,
        rejectedRows: parseResult.rejectedRows,
        duplicateRows: parseResult.duplicateRows,
        validationErrorsJson: parseResult.errors.length > 0 ? JSON.stringify(parseResult.errors) : null,
        summaryNotes: customDescription,
        importedBy: session.email,
        provenanceId: provenance.id,
      },
    });

    // 4. Batch insert accepted rows
    if (parseResult.acceptedRows.length > 0) {
      await db.energyMetric.createMany({
        data: parseResult.acceptedRows.map((row) => ({
          timestamp: row.timestamp,
          buildingId: row.buildingId,
          energySourceId: row.energySourceId,
          provenanceId: provenance.id,
          batchId: batch.id,
          isSimulated: isSimulatedForm,
          kwhConsumed: row.kwhConsumed,
          solarKwhGenerated: row.solarKwhGenerated,
          dieselLitres: row.dieselLitres,
          generatorRuntimeHours: row.generatorRuntimeHours,
          generatorKwhGenerated: row.generatorKwhGenerated,
          biogasM3Consumed: row.biogasM3Consumed,
          biogasKwhGenerated: row.biogasKwhGenerated,
          peakDemandKw: row.peakDemandKw,
          powerFactor: row.powerFactor,
          carbonKgEmitted: row.carbonKgEmitted,
          carbonKgAvoided: row.carbonKgAvoided,
          notes: row.notes,
          rawPayload: row.rawPayload,
        })),
      });
    }

    // 5. Audit Log
    await db.auditLog.create({
      data: {
        action: "BATCH_IMPORT_COMPLETED",
        performedBy: session.email,
        details: `Imported ${filename}: ${parseResult.acceptedRows.length} accepted, ${parseResult.duplicateRows} duplicates skipped, ${parseResult.rejectedRows} rejected.`,
      },
    });

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      summary: {
        totalRows: parseResult.totalRows,
        acceptedRows: parseResult.acceptedRows.length,
        duplicateRows: parseResult.duplicateRows,
        rejectedRows: parseResult.rejectedRows,
        errors: parseResult.errors.slice(0, 50), // return top 50 errors if any
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process file upload" },
      { status: 500 }
    );
  }
}
