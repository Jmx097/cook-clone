import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";


const EXPORT_ROOT = path.join(process.cwd(), "data", "exports");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const { id, filename } = await params;

  // 1. Security Check: Path Traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Invalid filename", { status: 400 });
  }

  // 2. Resolve Path
  const filePath = path.join(EXPORT_ROOT, id, filename);

  // 3. Verify Existence
  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  // 4. Determine Content Type
  const ext = path.extname(filename).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".pdf") contentType = "application/pdf";
  if (ext === ".zip") contentType = "application/zip";

  // 5. Stream File (Node.js style stream for Next.js)
  const fileStream = fs.createReadStream(filePath);
  
  // Create readable stream for Response
  const stream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
