import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        user: { findUnique: vi.fn(), delete: vi.fn() },
    };
    return { default: prisma, prisma };
});

vi.mock("../../src/providers/ProviderFactory.js", () => ({
    ProviderFactory: { getProvider: vi.fn() },
}));

vi.mock("../../src/utils/profileFiles.js", () => ({
    deletePhysicalProfileFiles: vi.fn().mockResolvedValue(undefined),
}));

import prisma from "../../src/prisma";
import { ProviderFactory } from "../../src/providers/ProviderFactory.js";
import { deletePhysicalProfileFiles } from "../../src/utils/profileFiles.js";
import { deleteAccount } from "../../src/controllers/compliance";

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

describe("deleteAccount — physical file cleanup", () => {
    it("cleans up the profile's video and avatar files before deleting the user", async () => {
        const profile = { id: "p1", avatarUrl: "/uploads/avatars/a.jpg", videos: [{ providerId: "v1" }] };
        (prisma.user.findUnique as any).mockResolvedValue({ id: "u1", profile });
        (prisma.user.delete as any).mockResolvedValue({ id: "u1" });
        const provider = { delete: vi.fn() };
        (ProviderFactory.getProvider as any).mockReturnValue(provider);

        const req: any = { body: { user: { id: "u1" } } };
        const res = mockRes();

        await deleteAccount(req, res, next);

        expect(deletePhysicalProfileFiles).toHaveBeenCalledWith(profile, provider);
        expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("skips file cleanup when the user has no profile", async () => {
        (prisma.user.findUnique as any).mockResolvedValue({ id: "u1", profile: null });
        (prisma.user.delete as any).mockResolvedValue({ id: "u1" });

        const req: any = { body: { user: { id: "u1" } } };
        const res = mockRes();

        await deleteAccount(req, res, next);

        expect(deletePhysicalProfileFiles).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
