import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// GET /api/uploads/[filename] — Stream dynamic uploaded images (Vercel tmp or local)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);

    const candidates = [
      path.join(process.cwd(), 'public', 'uploads', safeFilename),
      path.join(os.tmpdir(), 'dolphin_uploads', safeFilename),
      path.join(os.tmpdir(), safeFilename),
    ];

    let foundPath: string | null = null;
    for (const p of candidates) {
      if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const buffer = await fs.promises.readFile(/*turbopackIgnore: true*/ foundPath);
    const ext = path.extname(safeFilename).toLowerCase().replace('.', '');
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      avif: 'image/avif',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Failed to serve uploaded image:', err);
    return NextResponse.json({ error: 'Failed to read image' }, { status: 500 });
  }
}
