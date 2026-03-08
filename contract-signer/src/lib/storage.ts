import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  await ensureUploadDir();

  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString("hex");
  const fileName = `${hash}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await writeFile(filePath, buffer);

  return `/api/files/${fileName}`;
}

export async function getFile(fileName: string): Promise<Buffer> {
  const filePath = path.join(UPLOAD_DIR, fileName);
  return readFile(filePath);
}
