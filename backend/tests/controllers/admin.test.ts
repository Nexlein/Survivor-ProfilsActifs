import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        user: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        profile: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    };
    return { default: prisma, prisma };
});

import prisma from "../../src/prisma";
import {
    getModerationQueue,
    approveModeration,
    rejectModeration,
    suspendModeration,
    hideProfile,
} from "../../src/controllers/admin";

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

describe("getModerationQueue", () => {
    it("lists only PENDING accounts, most recently registered last", async () => {
        (prisma.user.findMany as any).mockResolvedValue([{ id: "u1", email: "a@a.com" }]);
        (prisma.user.count as any).mockResolvedValue(1);

        const req: any = { query: {} };
        const res = mockRes();

        await getModerationQueue(req, res, next);

        expect(prisma.user.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { moderationStatus: "PENDING" },
                take: 20,
                skip: 0,
                orderBy: { createdAt: "asc" },
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ users: [{ id: "u1", email: "a@a.com" }], total: 1, page: 1, pageSize: 20 });
    });

    it("paginates using the page query param", async () => {
        (prisma.user.findMany as any).mockResolvedValue([]);
        (prisma.user.count as any).mockResolvedValue(0);

        const req: any = { query: { page: "3" } };
        const res = mockRes();

        await getModerationQueue(req, res, next);

        expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 40, take: 20 }));
    });

    it("falls back to page 1 for an invalid page param instead of a negative skip", async () => {
        (prisma.user.findMany as any).mockResolvedValue([]);
        (prisma.user.count as any).mockResolvedValue(0);

        const req: any = { query: { page: "-5" } };
        const res = mockRes();

        await getModerationQueue(req, res, next);

        expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0 }));
    });
});

describe.each([
    ["approveModeration", approveModeration, "APPROVED"],
    ["rejectModeration", rejectModeration, "REJECTED"],
    ["suspendModeration", suspendModeration, "SUSPENDED"],
] as const)("%s", (_name, handler, expectedStatus) => {
    it(`updates the account's moderationStatus to ${expectedStatus}`, async () => {
        (prisma.user.findUnique as any).mockResolvedValue({ id: "u1" });
        (prisma.user.update as any).mockResolvedValue({ id: "u1", email: "a@a.com", role: "JOB_SEEKER", moderationStatus: expectedStatus });

        const req: any = { params: { userId: "u1" } };
        const res = mockRes();

        await handler(req, res, next);

        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: "u1" }, data: { moderationStatus: expectedStatus } })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ moderationStatus: expectedStatus }));
    });

    it("returns 404 without writing when the account does not exist", async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const req: any = { params: { userId: "missing" } };
        const res = mockRes();

        await handler(req, res, next);

        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("hideProfile", () => {
    it("flips the profile's visible flag to false without touching moderationStatus", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (prisma.profile.update as any).mockResolvedValue({ id: "p1", fullName: "Jane Doe", visible: false });

        const req: any = { params: { id: "p1" } };
        const res = mockRes();

        await hideProfile(req, res, next);

        expect(prisma.profile.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: "p1" }, data: { visible: false } })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 404 when the profile does not exist", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue(null);

        const req: any = { params: { id: "missing" } };
        const res = mockRes();

        await hideProfile(req, res, next);

        expect(prisma.profile.update).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
