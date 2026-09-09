import { IVideoProvider } from './IVideoProvider.js';
import fs from 'fs';
import { randomUUID } from 'crypto';

export class DummyVideoProvider implements IVideoProvider {

  async store(videoFile: Express.Multer.File, subtitleFile?: Express.Multer.File): Promise<string> {
    if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
    if (subtitleFile && fs.existsSync(subtitleFile.path)) fs.unlinkSync(subtitleFile.path);

    return `peertube-${randomUUID()}`;
  }

  async status(providerId: string): Promise<'PENDING' | 'READY' | 'ERROR'> {
    // Force PENDING to easily test UI degraded modes
    return 'PENDING';
  }

  async playbackUrl(providerId: string): Promise<string> {
    return `https://peertube.ministere.gouv.fr/w/${providerId}`;
  }

  async subtitleUrl(providerId: string): Promise<string | null> {
    return null;
  }

  async delete(providerId: string): Promise<void> {
    console.log(`[DummyVideoProvider] Mock delete signal sent for ${providerId}`);
  }

  async getLocalFilePath(providerId: string): Promise<string | null> {
    return null;
  }

  async getLocalSubtitlePath(providerId: string): Promise<string | null> {
    return null;
  }
}
