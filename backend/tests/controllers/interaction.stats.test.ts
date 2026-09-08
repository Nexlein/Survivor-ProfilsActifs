import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        interaction: { count: vi.fn().mockResolvedValue(0) },
        profile: { count: vi.fn().mockResolvedValue(0) },
        video: { count: vi.fn().mockResolvedValue(0) },
        user: { count: vi.fn().mockResolvedValue(0) },
    };
    return { default: prisma, prisma };
});

import prisma from "../../src/prisma";
import { getInteractionStats } from "../../src/controllers/interaction";

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const next = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    (prisma.interaction.count as any).mockResolvedValue(0);
    (prisma.profile.count as any).mockResolvedValue(0);
    (prisma.video.count as any).mockResolvedValue(0);
    (prisma.user.count as any).mockResolvedValue(0);
});

describe("getInteractionStats (ADMIN)", () => {
    it("only counts visible, admin-approved profiles as 'active'", async () => {
        const req: any = { body: { user: { id: "admin1", role: "ADMIN" } } };
        const res = mockRes();

        await getInteractionStats(req, res, next);

        expect(prisma.profile.count).toHaveBeenCalledWith({
            where: { visible: true, user: { moderationStatus: "APPROVED" } },
        });
    });

    it("returns exactly 7 weekly signup buckets covering the last 7 weeks", async () => {
        const req: any = { body: { user: { id: "admin1", role: "ADMIN" } } };
        const res = mockRes();

        await getInteractionStats(req, res, next);

        expect(prisma.user.count).toHaveBeenCalledTimes(7);

        const payload = (res.json as any).mock.calls[0][0];
        expect(payload.weeklySignups).toHaveLength(7);

        const starts = payload.weeklySignups.map((w: any) => new Date(w.weekStart).getTime());
        const sorted = [...starts].sort((a, b) => a - b);
        expect(starts).toEqual(sorted);
        for (let i = 1; i < starts.length; i++) {
            expect(starts[i] - starts[i - 1]).toBe(7 * 24 * 60 * 60 * 1000);
        }
    });

    it("reports the per-week signup count returned by prisma", async () => {
        (prisma.user.count as any).mockResolvedValue(3);
        const req: any = { body: { user: { id: "admin1", role: "ADMIN" } } };
        const res = mockRes();

        await getInteractionStats(req, res, next);

        const payload = (res.json as any).mock.calls[0][0];
        expect(payload.weeklySignups.every((w: any) => w.count === 3)).toBe(true);
    });
});
