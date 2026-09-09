import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        video: { findUnique: vi.fn() },
        profile: { findUnique: vi.fn() },
    };
    return { default: prisma, prisma };
});

vi.mock("../../src/providers/ProviderFactory", () => ({
    ProviderFactory: { getProvider: vi.fn() },
}));

vi.mock("fs", () => {
    const fs = {
        statSync: vi.fn(),
        createReadStream: vi.fn(),
        existsSync: vi.fn(),
    };
    return { default: fs, ...fs };
});

import prisma from "../../src/prisma";
import fs from "fs";
import { ProviderFactory } from "../../src/providers/ProviderFactory";
import { streamVideo, streamSubtitle } from "../../src/controllers/videoPlayback";

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    res.setHeader = vi.fn();
    res.writeHead = vi.fn();
    return res;
};

const next = vi.fn();

const approvedVideo = { id: "v1", profileId: "p1", status: "APPROVED", providerId: "prov1" };
const pendingVideo = { id: "v1", profileId: "p1", status: "PENDING", providerId: "prov1" };

const readyProvider = () => ({
    status: vi.fn().mockResolvedValue("READY"),
    getLocalFilePath: vi.fn().mockResolvedValue("/storage/videos/prov1.mp4"),
    getLocalSubtitlePath: vi.fn().mockResolvedValue("/storage/videos/prov1.vtt"),
});

beforeEach(() => {
    vi.clearAllMocks();
    (fs.createReadStream as any).mockReturnValue({ pipe: vi.fn() });
});

describe("streamVideo", () => {
    it("returns 404 when the video does not exist", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(null);
        const req: any = { params: { id: "missing" }, headers: {} };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("rejects an anonymous request for a non-approved video", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(pendingVideo);
        const req: any = { params: { id: "v1" }, headers: {} };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(ProviderFactory.getProvider).not.toHaveBeenCalled();
    });

    it("rejects a logged-in user who does not own the pending video and isn't admin", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(pendingVideo);
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "someone-else" });
        const req: any = { params: { id: "v1" }, headers: {}, user: { id: "u2", role: "RECRUITER" } };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("allows the owner to stream their own pending video", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(pendingVideo);
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (ProviderFactory.getProvider as any).mockReturnValue(readyProvider());
        (fs.statSync as any).mockReturnValue({ size: 1000 });
        const req: any = { params: { id: "v1" }, headers: {}, user: { id: "owner-user", role: "JOB_SEEKER" } };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.status).not.toHaveBeenCalledWith(403);
        expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({ "Content-Length": 1000 }));
    });

    it("allows anonymous access to an approved video", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(approvedVideo);
        (ProviderFactory.getProvider as any).mockReturnValue(readyProvider());
        (fs.statSync as any).mockReturnValue({ size: 500 });
        const req: any = { params: { id: "v1" }, headers: {} };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    });

    it("returns 503 when the provider has no local file (degraded / remote provider)", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(approvedVideo);
        (ProviderFactory.getProvider as any).mockReturnValue({
            status: vi.fn().mockResolvedValue("PENDING"),
            getLocalFilePath: vi.fn().mockResolvedValue(null),
            getLocalSubtitlePath: vi.fn().mockResolvedValue(null),
        });
        const req: any = { params: { id: "v1" }, headers: {} };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(503);
    });

    it("returns 416 for a Range header outside the file bounds", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(approvedVideo);
        (ProviderFactory.getProvider as any).mockReturnValue(readyProvider());
        (fs.statSync as any).mockReturnValue({ size: 100 });
        const req: any = { params: { id: "v1" }, headers: { range: "bytes=50-999" } };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(416);
    });

    it("returns 416 for a malformed Range header", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(approvedVideo);
        (ProviderFactory.getProvider as any).mockReturnValue(readyProvider());
        (fs.statSync as any).mockReturnValue({ size: 100 });
        const req: any = { params: { id: "v1" }, headers: { range: "bytes=abc-def" } };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.status).toHaveBeenCalledWith(416);
    });

    it("serves a valid Range request with 206", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(approvedVideo);
        (ProviderFactory.getProvider as any).mockReturnValue(readyProvider());
        (fs.statSync as any).mockReturnValue({ size: 100 });
        const req: any = { params: { id: "v1" }, headers: { range: "bytes=0-49" } };
        const res = mockRes();

        await streamVideo(req, res, next);

        expect(res.writeHead).toHaveBeenCalledWith(206, expect.objectContaining({ "Content-Length": 50 }));
    });
});

describe("streamSubtitle", () => {
    it("returns 404 when the video does not exist", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(null);
        const req: any = { params: { id: "missing" }, headers: {} };
        const res = mockRes();

        await streamSubtitle(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("rejects an anonymous request for a non-approved video's subtitle", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(pendingVideo);
        const req: any = { params: { id: "v1" }, headers: {} };
        const res = mockRes();

        await streamSubtitle(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(ProviderFactory.getProvider).not.toHaveBeenCalled();
    });

    it("returns 404 when the provider has no subtitle file", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(approvedVideo);
        (ProviderFactory.getProvider as any).mockReturnValue({
            getLocalSubtitlePath: vi.fn().mockResolvedValue(null),
        });
        const req: any = { params: { id: "v1" }, headers: {} };
        const res = mockRes();

        await streamSubtitle(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("streams the subtitle for an approved video", async () => {
        (prisma.video.findUnique as any).mockResolvedValue(approvedVideo);
        (ProviderFactory.getProvider as any).mockReturnValue({
            getLocalSubtitlePath: vi.fn().mockResolvedValue("/storage/videos/prov1.vtt"),
        });
        const req: any = { params: { id: "v1" }, headers: {} };
        const res = mockRes();

        await streamSubtitle(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/vtt");
        expect(fs.createReadStream).toHaveBeenCalledWith("/storage/videos/prov1.vtt");
    });
});
