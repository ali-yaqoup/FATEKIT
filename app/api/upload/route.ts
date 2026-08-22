import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getAdminSessionAction } from "@/lib/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
