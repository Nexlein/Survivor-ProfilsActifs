import { IVideoProvider } from './IVideoProvider.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { nodewhisper } from 'nodejs-whisper';

const execFileAsync = promisify(execFile);

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

    const subDest = path.join(STORAGE_DIR, `${providerId}.vtt`);

    if (subtitleFile) {
      fs.copyFileSync(subtitleFile.path, subDest);
      fs.unlinkSync(subtitleFile.path);
    } else {
      try {
        // Auto-generate subtitles via local whisper
        const wavTmp = path.join(STORAGE_DIR, `${providerId}.wav`);
        
        // 1. Extract audio to 16kHz WAV (required by whisper.cpp)
        await execFileAsync('ffmpeg', [
          '-i', videoDest,
          '-ar', '16000',
          '-ac', '1',
          '-c:a', 'pcm_s16le',
          wavTmp
        ]);

        // 2. Transcribe to VTT
        await nodewhisper(wavTmp, {
          modelName: 'tiny', // lightweight model
          autoDownloadModelName: 'tiny',
          whisperOptions: {
            language: 'fr',
            outputInVtt: true
          }
        });

        // nodejs-whisper creates a <filename>.wav.vtt file in the same directory
        const generatedVtt = `${wavTmp}.vtt`;
        if (fs.existsSync(generatedVtt)) {
          fs.renameSync(generatedVtt, subDest);
        }

        // Clean up tmp wav
        if (fs.existsSync(wavTmp)) fs.unlinkSync(wavTmp);
      } catch (err) {
        console.error('Failed to auto-generate subtitles for', providerId, err);
        // We don't fail the upload if subtitle generation fails (best-effort fallback)
      }
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
