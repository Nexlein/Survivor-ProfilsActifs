import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        profile: { findUnique: vi.fn() },
        interaction: { findFirst: vi.fn(), delete: vi.fn(), create: vi.fn() },
    };
    return { default: prisma, prisma };
});

import prisma from "../../src/prisma";
import { createInteraction } from "../../src/controllers/interaction";

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const next = vi.fn();
const recruiter = { id: "r1", role: "RECRUITER" };

beforeEach(() => {
    vi.clearAllMocks();
});

describe("createInteraction — LIKE is banned", () => {
    it("rejects type LIKE with a 400, without touching the DB", async () => {
        const req: any = { body: { user: recruiter, profileId: "p1", type: "LIKE" } };
        const res = mockRes();

        await createInteraction(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.profile.findUnique).not.toHaveBeenCalled();
        expect(prisma.interaction.create).not.toHaveBeenCalled();
    });
});

describe("createInteraction — FAVORITE is unaffected", () => {
    it("creates a FAVORITE interaction when none exists yet", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (prisma.interaction.findFirst as any).mockResolvedValue(null);
        (prisma.interaction.create as any).mockResolvedValue({ id: "i1" });

        const req: any = { body: { user: recruiter, profileId: "p1", type: "FAVORITE" } };
        const res = mockRes();

        await createInteraction(req, res, next);

        expect(prisma.interaction.create).toHaveBeenCalledWith({
            data: { recruiterId: "r1", profileId: "p1", type: "FAVORITE" },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ active: true, interaction: { id: "i1" } });
    });

    it("toggles off an existing FAVORITE", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
        (prisma.interaction.findFirst as any).mockResolvedValue({ id: "existing" });

        const req: any = { body: { user: recruiter, profileId: "p1", type: "FAVORITE" } };
        const res = mockRes();

        await createInteraction(req, res, next);

        expect(prisma.interaction.delete).toHaveBeenCalledWith({ where: { id: "existing" } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ active: false });
    });
});
