import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { verifySessionToken } from '@/lib/auth';

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const TMP_UPLOADS_DIR = path.join(os.tmpdir(), 'dolphin_uploads');

function getWritableUploadsDir(): { dir: string; isTmp: boolean } {
  // If running on Vercel or Lambda, cwd is read-only
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (!fs.existsSync(TMP_UPLOADS_DIR)) {
      try {
        fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
      } catch {}
    }
    return { dir: TMP_UPLOADS_DIR, isTmp: true };
  }

  // Locally, test if public/uploads is writable
  try {
    if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
      fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
    }
    const testFile = path.join(LOCAL_UPLOADS_DIR, '.write_test');
    fs.writeFileSync(testFile, 'ok', 'utf-8');
    fs.unlinkSync(testFile);
    return { dir: LOCAL_UPLOADS_DIR, isTmp: false };
  } catch {
    // Read-only fallback
    if (!fs.existsSync(TMP_UPLOADS_DIR)) {
      try {
        fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
      } catch {}
    }
    return { dir: TMP_UPLOADS_DIR, isTmp: true };
  }
}

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

    // 3. Validate File Size (allow up to 25MB for high-res camera photos)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File is too large. Maximum size allowed is 25MB.' },
        { status: 400 }
      );
    }

    // 4. Validate MIME Type & determine extension
    const mimeType = (file.type || '').toLowerCase();
    const allowedMimes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
      'image/heic': 'jpg',
      'image/heif': 'jpg',
    };

    let extension = allowedMimes[mimeType];
    if (!extension) {
      // Fallback: check file name extension if mimeType is generic image/* or octet-stream
      const nameExt = path.extname(file.name).toLowerCase().replace('.', '');
      if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic', 'heif'].includes(nameExt)) {
        extension = nameExt === 'jpeg' || nameExt === 'heic' || nameExt === 'heif' ? 'jpg' : nameExt;
      } else {
        extension = 'webp'; // default fallback for image data
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Generate safe unique filename
    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    // 6. Save to storage
    const { dir, isTmp } = getWritableUploadsDir();
    const filePath = path.join(dir, safeName);

    try {
      if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
        fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
      }
      await fs.promises.writeFile(/*turbopackIgnore: true*/ filePath, buffer);
    } catch (writeErr) {
      console.warn('[upload] Primary write failed, attempting /tmp emergency:', writeErr);
      try {
        const emergencyPath = path.join(/*turbopackIgnore: true*/ os.tmpdir(), safeName);
        await fs.promises.writeFile(/*turbopackIgnore: true*/ emergencyPath, buffer);
      } catch (e2) {
        console.error('[upload] Emergency write failed:', e2);
      }
    }

    // Public URL served either directly or via the dynamic streaming route
    const publicUrl = isTmp ? `/api/uploads/${safeName}` : `/uploads/${safeName}`;

    // Also generate data URL as an ultra-reliable embed option
    const base64Data = buffer.toString('base64');
    const effectiveMime = mimeType && mimeType.startsWith('image/') ? mimeType : `image/${extension}`;
    const dataUrl = `data:${effectiveMime};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: publicUrl,
      dataUrl,
      fileName: safeName,
      size: file.size,
    });
  } catch (err: unknown) {
    console.error('Image upload failed:', err);
    return NextResponse.json(
      { success: false, error: 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
