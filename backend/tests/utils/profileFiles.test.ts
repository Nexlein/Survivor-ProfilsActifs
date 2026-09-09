import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs", () => {
    const fs = { unlink: vi.fn((_path: string, cb: (err: NodeJS.ErrnoException | null) => void) => cb(null)) };
    return { default: fs, ...fs };
});

import fs from "fs";
import { deletePhysicalProfileFiles } from "../../src/utils/profileFiles";

const mockProvider = () => ({
    store: vi.fn(),
    status: vi.fn(),
    playbackUrl: vi.fn(),
    subtitleUrl: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    getLocalFilePath: vi.fn(),
    getLocalSubtitlePath: vi.fn(),
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("deletePhysicalProfileFiles", () => {
    it("deletes every video via the provider abstraction", async () => {
        const provider = mockProvider();
        await deletePhysicalProfileFiles(
            { avatarUrl: null, videos: [{ providerId: "v1" }, { providerId: "v2" }] },
            provider as any
        );

        expect(provider.delete).toHaveBeenCalledWith("v1");
        expect(provider.delete).toHaveBeenCalledWith("v2");
    });

    it("continues deleting remaining videos when one provider.delete() call fails", async () => {
        const provider = mockProvider();
        provider.delete.mockRejectedValueOnce(new Error("disk error")).mockResolvedValueOnce(undefined);

        await expect(
            deletePhysicalProfileFiles({ avatarUrl: null, videos: [{ providerId: "v1" }, { providerId: "v2" }] }, provider as any)
        ).resolves.not.toThrow();

        expect(provider.delete).toHaveBeenCalledTimes(2);
    });

    it("deletes a locally-stored avatar file", async () => {
        const provider = mockProvider();
        await deletePhysicalProfileFiles({ avatarUrl: "/uploads/avatars/123-abc.jpg", videos: [] }, provider as any);

        expect(fs.unlink).toHaveBeenCalledWith(
            expect.stringContaining(require("path").join("uploads", "avatars", "123-abc.jpg")),
            expect.any(Function)
        );
    });

    it("leaves an external avatar URL alone", async () => {
        const provider = mockProvider();
        await deletePhysicalProfileFiles({ avatarUrl: "https://cdn.example.com/seed.jpg", videos: [] }, provider as any);

        expect(fs.unlink).not.toHaveBeenCalled();
    });

    it("does nothing for a profile with no avatar", async () => {
        const provider = mockProvider();
        await deletePhysicalProfileFiles({ avatarUrl: null, videos: [] }, provider as any);

        expect(fs.unlink).not.toHaveBeenCalled();
        expect(provider.delete).not.toHaveBeenCalled();
    });
});
