import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        interaction: { findMany: vi.fn() },
    };
    return { default: prisma, prisma };
});

import prisma from "../../src/prisma";
import { getSentContacts } from "../../src/controllers/interaction";

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

describe("getSentContacts", () => {
    it("rejects a non-recruiter", async () => {
        const req: any = { body: { user: { id: "u1", role: "JOB_SEEKER" } } };
        const res = mockRes();

        await getSentContacts(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(prisma.interaction.findMany).not.toHaveBeenCalled();
    });

    it("includes the candidate-side read status alongside each contact", async () => {
        (prisma.interaction.findMany as any).mockResolvedValue([
            { id: "i1", message: "Bonjour", read: true, createdAt: new Date(), profile: { userId: "u2", fullName: "Jane Doe" } },
        ]);

        const req: any = { body: { user: { id: "r1", role: "RECRUITER" } } };
        const res = mockRes();

        await getSentContacts(req, res, next);

        expect(prisma.interaction.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { recruiterId: "r1", type: "CONTACT" },
                select: expect.objectContaining({ read: true }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        const payload = (res.json as any).mock.calls[0][0];
        expect(payload[0].read).toBe(true);
    });
});
