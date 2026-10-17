import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifySessionToken } from '@/lib/auth';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Admin Session
    const token =
      req.cookies.get('admin_session')?.value ||
      req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const verified = verifySessionToken(token);
    if (!verified.valid || verified.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin privilege required' },
        { status: 403 }
      );
    }

    // 2. Read multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate File Size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File is too large. Maximum size allowed is 5MB.' },
        { status: 400 }
      );
    }

    // 4. Validate MIME Type & Extension
    const mimeType = file.type.toLowerCase();
    const allowedMimes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    const extension = allowedMimes[mimeType];
    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP.',
        },
        { status: 400 }
      );
    }

    // 5. Ensure storage directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // 6. Generate safe unique filename
    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: publicUrl,
      fileName: safeName,
    });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    return NextResponse.json(
      { success: false, error: 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
