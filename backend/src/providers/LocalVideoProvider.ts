import { IVideoProvider } from './IVideoProvider.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Files are stored completely outside the public web directory
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'videos');

export class LocalVideoProvider implements IVideoProvider {
  constructor() {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  }

  async store(videoFile: Express.Multer.File, subtitleFile?: Express.Multer.File): Promise<string> {
    const providerId = randomUUID();
    const videoExt = path.extname(videoFile.originalname) || '.mp4';

    const videoDest = path.join(STORAGE_DIR, `${providerId}${videoExt}`);
    fs.copyFileSync(videoFile.path, videoDest);
    fs.unlinkSync(videoFile.path);

    if (subtitleFile) {
      const subDest = path.join(STORAGE_DIR, `${providerId}.vtt`);
      fs.copyFileSync(subtitleFile.path, subDest);
      fs.unlinkSync(subtitleFile.path);
    }

    return providerId;
  }

  async status(providerId: string): Promise<'PENDING' | 'READY' | 'ERROR'> {
    const files = fs.readdirSync(STORAGE_DIR);
    const exists = files.some(f => f.startsWith(providerId));
    return exists ? 'READY' : 'ERROR';
  }

  async playbackUrl(providerId: string): Promise<string> {
    return `/api/videos/play/${providerId}`;
  }

  async subtitleUrl(providerId: string): Promise<string | null> {
    const subPath = path.join(STORAGE_DIR, `${providerId}.vtt`);
    if (fs.existsSync(subPath)) {
      return `/api/videos/subtitle/${providerId}`;
    }
    return null;
  }

  async delete(providerId: string): Promise<void> {
    // Hard physical deletion (GDPR compliance)
    const files = fs.readdirSync(STORAGE_DIR);
    for (const file of files) {
      if (file.startsWith(providerId)) {
        fs.unlinkSync(path.join(STORAGE_DIR, file));
      }
    }
  }
}
