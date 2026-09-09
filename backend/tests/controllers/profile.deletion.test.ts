import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        profile: { findUnique: vi.fn(), delete: vi.fn() },
    };
    return { default: prisma, prisma };
});

vi.mock("../../src/providers/ProviderFactory", () => ({
    ProviderFactory: { getProvider: vi.fn() },
}));

vi.mock("../../src/utils/profileFiles", () => ({
    deletePhysicalProfileFiles: vi.fn().mockResolvedValue(undefined),
}));

import prisma from "../../src/prisma";
import { ProviderFactory } from "../../src/providers/ProviderFactory";
import { deletePhysicalProfileFiles } from "../../src/utils/profileFiles";
import { deleteProfile } from "../../src/controllers/profile";

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

describe("deleteProfile — physical file cleanup", () => {
    it("returns 404 without touching files when the profile doesn't exist", async () => {
        (prisma.profile.findUnique as any).mockResolvedValue(null);
        const req: any = { body: { user: { id: "u1" } } };
        const res = mockRes();

        await deleteProfile(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(deletePhysicalProfileFiles).not.toHaveBeenCalled();
    });

    it("deletes physical files before deleting the profile row", async () => {
        const existing = { id: "p1", avatarUrl: "/uploads/avatars/a.jpg", videos: [{ providerId: "v1" }] };
        (prisma.profile.findUnique as any).mockResolvedValue(existing);
        (prisma.profile.delete as any).mockResolvedValue(existing);
        const provider = { delete: vi.fn() };
        (ProviderFactory.getProvider as any).mockReturnValue(provider);

        const req: any = { body: { user: { id: "u1" } } };
        const res = mockRes();

        await deleteProfile(req, res, next);

        expect(deletePhysicalProfileFiles).toHaveBeenCalledWith(existing, provider);
        expect(prisma.profile.delete).toHaveBeenCalledWith({ where: { userId: "u1" } });
        expect(res.json).toHaveBeenCalledWith(existing);
    });
});
