import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        profile: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
        },
    };
    return { default: prisma, prisma };
});

import prisma from "../../src/prisma";
import { getAllProfiles, getProfileByUserId } from "../../src/controllers/profile";

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const next = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
});


describe("getAllProfiles moderation gate", () => {
    it("only surfaces accounts approved by an admin, for an unauthenticated visitor", async () => {
        (prisma.profile.findMany as any).mockResolvedValue([]);
        (prisma.profile.count as any).mockResolvedValue(0);

        const req: any = { query: {} };
        const res = mockRes();

        await getAllProfiles(req, res, next);

        const whereClause = (prisma.profile.findMany as any).mock.calls[0][0].where;
        expect(whereClause.user.moderationStatus).toBe("APPROVED");
    });

    it("still applies the moderation gate for an authenticated recruiter", async () => {
        (prisma.profile.findMany as any).mockResolvedValue([]);
        (prisma.profile.count as any).mockResolvedValue(0);

        const req: any = { query: {}, user: { id: "r1", role: "RECRUITER" } };
        const res = mockRes();

        await getAllProfiles(req, res, next);

        const whereClause = (prisma.profile.findMany as any).mock.calls[0][0].where;
        expect(whereClause.user.moderationStatus).toBe("APPROVED");
    });
});

describe("getProfileByUserId moderation gate", () => {
    const pendingProfile = {
        id: "p1",
        userId: "u1",
        visible: true,
        videos: [],
        user: { id: "u1", dateOfBirth: new Date("1990-01-01"), moderationStatus: "PENDING" },
    };

    it("denies an anonymous visitor access to a not-yet-approved profile", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue(pendingProfile);

        const req: any = { params: { id: "u1" } };
        const res = mockRes();

        await getProfileByUserId(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Access denied: Profile is pending moderation" });
    });

    it("lets an admin see a not-yet-approved profile in order to moderate it", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue(pendingProfile);

        const req: any = { params: { id: "u1" }, user: { id: "admin1", role: "ADMIN" } };
        const res = mockRes();

        await getProfileByUserId(req, res, next);

        expect(res.status).not.toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalled();
    });

    it("lets the profile owner see their own pending profile", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue(pendingProfile);

        const req: any = { params: { id: "u1" }, user: { id: "u1", role: "JOB_SEEKER" } };
        const res = mockRes();

        await getProfileByUserId(req, res, next);

        expect(res.status).not.toHaveBeenCalledWith(403);
    });

    it("still allows access to an approved, visible, adult profile", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({
            ...pendingProfile,
            user: { ...pendingProfile.user, moderationStatus: "APPROVED" },
        });

        const req: any = { params: { id: "u1" } };
        const res = mockRes();

        await getProfileByUserId(req, res, next);

        expect(res.status).not.toHaveBeenCalledWith(403);
    });
});
