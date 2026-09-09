import fs from 'fs';
import path from 'path';
import { IVideoProvider } from '../providers/IVideoProvider.js';

interface ProfileWithMedia {
    avatarUrl: string | null;
    videos: { providerId: string }[];
}

// Physically removes every file a profile owns: each video via the
// IVideoProvider abstraction, plus the locally-stored avatar. An external
// avatarUrl (e.g. a seeded demo photo) is left alone since it isn't a file
// we own on disk. Shared by every account/profile deletion path so none of
// them can drift out of sync on GDPR compliance.
export async function deletePhysicalProfileFiles(profile: ProfileWithMedia, provider: IVideoProvider): Promise<void> {
    for (const video of profile.videos) {
        try {
            await provider.delete(video.providerId);
        } catch (err) {
            console.error(`[RGPD] Failed to delete video ${video.providerId}`, err);
        }
    }

    if (profile.avatarUrl?.startsWith('/uploads/avatars/')) {
        const avatarPath = path.resolve(__dirname, '../..', profile.avatarUrl.replace(/^\//, ''));
        fs.unlink(avatarPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error(`[RGPD] Failed to delete avatar ${avatarPath}`, err);
            }
        });
    }
}
