import { IVideoProvider } from './IVideoProvider.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Files are stored completely outside the public web directory.
// Resolved relative to this module, not process.cwd(), so the path stays
// correct regardless of the working directory the process was started from.
const STORAGE_DIR = path.resolve(__dirname, '../../storage/videos');

export class LocalVideoProvider implements IVideoProvider {
  // Caches providerId -> stored filename so playback doesn't need to
  // re-scan the storage directory on every request.
  private fileNameCache = new Map<string, string>();

  constructor() {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  }

  async store(videoFile: Express.Multer.File, subtitleFile?: Express.Multer.File): Promise<string> {
    const providerId = randomUUID();
    const videoExt = path.extname(videoFile.originalname) || '.mp4';

    const videoFileName = `${providerId}${videoExt}`;
    const videoDest = path.join(STORAGE_DIR, videoFileName);
    fs.copyFileSync(videoFile.path, videoDest);
    fs.unlinkSync(videoFile.path);
    this.fileNameCache.set(providerId, videoFileName);

    if (subtitleFile) {
      const subDest = path.join(STORAGE_DIR, `${providerId}.vtt`);
      fs.copyFileSync(subtitleFile.path, subDest);
      fs.unlinkSync(subtitleFile.path);
    }

    return providerId;
  }

  private resolveVideoFileName(providerId: string): string | null {
    const cached = this.fileNameCache.get(providerId);
    if (cached) return cached;

    const files = fs.readdirSync(STORAGE_DIR);
    const match = files.find(f => f.startsWith(providerId) && !f.endsWith('.vtt'));
    if (match) this.fileNameCache.set(providerId, match);
    return match ?? null;
  }

  async status(providerId: string): Promise<'PENDING' | 'READY' | 'ERROR'> {
    return this.resolveVideoFileName(providerId) ? 'READY' : 'ERROR';
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

  async getLocalFilePath(providerId: string): Promise<string | null> {
    const fileName = this.resolveVideoFileName(providerId);
    return fileName ? path.join(STORAGE_DIR, fileName) : null;
  }

  async getLocalSubtitlePath(providerId: string): Promise<string | null> {
    const subPath = path.join(STORAGE_DIR, `${providerId}.vtt`);
    return fs.existsSync(subPath) ? subPath : null;
  }

  async delete(providerId: string): Promise<void> {
    // Hard physical deletion (GDPR compliance)
    const files = fs.readdirSync(STORAGE_DIR);
    for (const file of files) {
      if (file.startsWith(providerId)) {
        fs.unlinkSync(path.join(STORAGE_DIR, file));
      }
    }
    this.fileNameCache.delete(providerId);
  }
}
