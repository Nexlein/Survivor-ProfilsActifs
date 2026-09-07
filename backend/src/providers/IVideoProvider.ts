export interface IVideoProvider {
  // Save video and optional subtitle. Returns opaque providerId.
  store(videoFile: Express.Multer.File, subtitleFile?: Express.Multer.File): Promise<string>;

  // Return the processing status from the provider.
  status(providerId: string): Promise<'PENDING' | 'READY' | 'ERROR'>;

  // Return the application or remote URL for video streaming.
  playbackUrl(providerId: string): Promise<string>;

  // Return the application or remote URL for subtitle streaming (RGAA compliance).
  subtitleUrl(providerId: string): Promise<string | null>;

  // GDPR Right to be Forgotten: physically remove the media associated with this ID.
  delete(providerId: string): Promise<void>;
}
