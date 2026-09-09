import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        profile: { findUnique: vi.fn() },
        video: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    };
    return { default: prisma, prisma };
});

vi.mock("../../src/providers/ProviderFactory", () => ({
    ProviderFactory: { getProvider: vi.fn(), getProviderName: vi.fn().mockReturnValue("local") },
}));

vi.mock("../../src/utils/videoMagicBytes.js", () => ({ isValidVideoFile: vi.fn().mockReturnValue(true) }));

vi.mock("fs", () => {
    const fs = { unlink: vi.fn((_path: string, cb: (err: Error | null) => void) => cb(null)) };
    return { default: fs, ...fs };
});

import prisma from "../../src/prisma";
import fs from "fs";
import { ProviderFactory } from "../../src/providers/ProviderFactory";
import { isValidVideoFile } from "../../src/utils/videoMagicBytes.js";
import { createProfileVideo, deleteProfileVideo } from "../../src/controllers/video";

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const next = vi.fn();
const videoFile = { path: "/tmp/vid.mp4", originalname: "vid.mp4" };
const subtitleFile = { path: "/tmp/sub.vtt", originalname: "sub.vtt" };

beforeEach(() => {
    vi.clearAllMocks();
    (isValidVideoFile as any).mockReturnValue(true);
});

describe("createProfileVideo — orphan cleanup", () => {
    it("cleans up the uploaded files when the profile isn't found (404)", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue(null);
        const req: any = {
            user: { id: "u1" },
            body: {},
            files: { video: [videoFile] },
        };
        const res = mockRes();

        await createProfileVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(fs.unlink).toHaveBeenCalledWith(videoFile.path, expect.any(Function));
    });

    it("cleans up both files when type is LINK (400)", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        const req: any = {
            user: { id: "u1" },
            body: { type: "LINK" },
            files: { video: [videoFile], subtitle: [subtitleFile] },
        };
        const res = mockRes();

        await createProfileVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(fs.unlink).toHaveBeenCalledWith(videoFile.path, expect.any(Function));
        expect(fs.unlink).toHaveBeenCalledWith(subtitleFile.path, expect.any(Function));
    });

    it("cleans up the file when the content is invalid", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (isValidVideoFile as any).mockReturnValue(false);
        const req: any = {
            user: { id: "u1" },
            body: {},
            files: { video: [videoFile] },
        };
        const res = mockRes();

        await createProfileVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(fs.unlink).toHaveBeenCalledWith(videoFile.path, expect.any(Function));
    });

    it("does not delete the file after a successful store (ownership passed to the provider)", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (ProviderFactory.getProvider as any).mockReturnValue({ store: vi.fn().mockResolvedValue("prov1") });
        (prisma.video.create as any).mockResolvedValue({ id: "v1" });
        const req: any = {
            user: { id: "u1" },
            body: {},
            files: { video: [videoFile] },
        };
        const res = mockRes();

        await createProfileVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(fs.unlink).not.toHaveBeenCalled();
    });
});

describe("deleteProfileVideo — disk-before-DB ordering", () => {
    const existingVideo = { id: "v1", profileId: "p1", providerId: "prov1" };

    it("does not delete the DB row when the physical file deletion fails", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (prisma.video.findUnique as any).mockResolvedValue(existingVideo);
        (ProviderFactory.getProvider as any).mockReturnValue({ delete: vi.fn().mockRejectedValue(new Error("disk full")) });
        const req: any = { user: { id: "u1", role: "JOB_SEEKER" }, params: { id: "v1" } };
        const res = mockRes();

        await deleteProfileVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(prisma.video.delete).not.toHaveBeenCalled();
    });

    it("deletes the DB row after the physical file is removed", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (prisma.video.findUnique as any).mockResolvedValue(existingVideo);
        (prisma.video.delete as any).mockResolvedValue({ id: "v1" });
        const providerDelete = vi.fn().mockResolvedValue(undefined);
        (ProviderFactory.getProvider as any).mockReturnValue({ delete: providerDelete });
        const req: any = { user: { id: "u1", role: "JOB_SEEKER" }, params: { id: "v1" } };
        const res = mockRes();

        await deleteProfileVideo(req, res, next);

        expect(providerDelete).toHaveBeenCalledWith("prov1");
        expect(prisma.video.delete).toHaveBeenCalledWith({ where: { id: "v1" } });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
