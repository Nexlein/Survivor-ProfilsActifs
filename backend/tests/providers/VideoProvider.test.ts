import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "multer";
import { LocalVideoProvider } from '../../src/providers/LocalVideoProvider.js';
import { DummyVideoProvider } from '../../src/providers/DummyVideoProvider.js';
import { IVideoProvider } from '../../src/providers/IVideoProvider.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

describe('VideoProvider Abstraction', () => {

    const runProviderTests = (providerName: string, provider: IVideoProvider) => {
        describe(`Provider: ${providerName}`, () => {
            let tempVideoPath: string;

            beforeEach(() => {
                tempVideoPath = path.join(process.cwd(), `temp-test-video-${randomUUID()}.mp4`);
                fs.writeFileSync(tempVideoPath, 'fake-video-content');
            });

            afterEach(() => {
                if (fs.existsSync(tempVideoPath)) {
                    fs.unlinkSync(tempVideoPath);
                }
            });

            it('should store a video and return a providerId', async () => {
                const mockFile = {
                    path: tempVideoPath,
                    originalname: 'test.mp4'
                } as Express.Multer.File;

                const providerId = await provider.store(mockFile);
                expect(providerId).toBeDefined();
                expect(typeof providerId).toBe('string');
            });

            it('should return a status', async () => {
                const mockFile = {
                    path: tempVideoPath,
                    originalname: 'test.mp4'
                } as Express.Multer.File;

                const providerId = await provider.store(mockFile);
                const status = await provider.status(providerId);
                expect(['PENDING', 'READY', 'ERROR']).toContain(status);
            });

            it('should return a playback URL', async () => {
                const mockFile = {
                    path: tempVideoPath,
                    originalname: 'test.mp4'
                } as Express.Multer.File;

                const providerId = await provider.store(mockFile);
                const url = await provider.playbackUrl(providerId);
                expect(url).toBeDefined();
                expect(typeof url).toBe('string');
            });

            it('should delete a video without crashing', async () => {
                const mockFile = {
                    path: tempVideoPath,
                    originalname: 'test.mp4'
                } as Express.Multer.File;

                const providerId = await provider.store(mockFile);
                await expect(provider.delete(providerId)).resolves.not.toThrow();
            });
        });
    };

    runProviderTests('Local', new LocalVideoProvider());
    runProviderTests('Dummy', new DummyVideoProvider());
});
