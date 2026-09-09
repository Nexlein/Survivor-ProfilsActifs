import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        user: { findUnique: vi.fn(), create: vi.fn() },
    };
    return { default: prisma, prisma };
});

vi.mock("bcrypt", () => ({
    default: { hash: vi.fn().mockResolvedValue("hashed"), compare: vi.fn() },
}));

vi.mock("jsonwebtoken", () => ({
    default: { sign: vi.fn().mockReturnValue("signed-token"), verify: vi.fn() },
}));

import prisma from "../../src/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { register, login, refresh } from "../../src/controllers/auth";

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

describe("register — age verification", () => {
    it("rejects a candidate under 16 years old", async () => {
        const under16 = new Date();
        under16.setFullYear(under16.getFullYear() - 10);

        const req: any = {
            body: { email: "a@b.com", password: "pw", fullName: "A B", role: "JOB_SEEKER", dateOfBirth: under16.toISOString() },
        };
        const res = mockRes();

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("accepts a candidate at exactly 16 years old", async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);
        (prisma.user.create as any).mockResolvedValue({ id: "u1" });
        const exactly16 = new Date();
        exactly16.setFullYear(exactly16.getFullYear() - 16);

        const req: any = {
            body: { email: "a@b.com", password: "pw", fullName: "A B", role: "JOB_SEEKER", dateOfBirth: exactly16.toISOString() },
        };
        const res = mockRes();

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("rejects a duplicate email with 409", async () => {
        (prisma.user.findUnique as any).mockResolvedValue({ id: "existing" });

        const req: any = { body: { email: "a@b.com", password: "pw", fullName: "A B", role: "JOB_SEEKER" } };
        const res = mockRes();

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("requires email, password and fullName", async () => {
        const req: any = { body: { email: "a@b.com" } };
        const res = mockRes();

        await register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe("login", () => {
    it("rejects an unknown email with 401 without leaking which field was wrong", async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const req: any = { body: { email: "nope@b.com", password: "pw" } };
        const res = mockRes();

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it("rejects a wrong password with 401", async () => {
        (prisma.user.findUnique as any).mockResolvedValue({ id: "u1", email: "a@b.com", passwordHash: "hashed", role: "JOB_SEEKER" });
        (bcrypt.compare as any).mockResolvedValue(false);

        const req: any = { body: { email: "a@b.com", password: "wrong" } };
        const res = mockRes();

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("issues a token on valid credentials", async () => {
        (prisma.user.findUnique as any).mockResolvedValue({ id: "u1", email: "a@b.com", passwordHash: "hashed", role: "JOB_SEEKER", profile: null });
        (bcrypt.compare as any).mockResolvedValue(true);

        const req: any = { body: { email: "a@b.com", password: "correct" } };
        const res = mockRes();

        await login(req, res, next);

        expect(jwt.sign).toHaveBeenCalledWith({ id: "u1", role: "JOB_SEEKER" }, expect.any(String), expect.any(Object));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "signed-token" }));
    });
});

describe("refresh", () => {
    it("rejects when no token is provided", async () => {
        const req: any = { body: {} };
        const res = mockRes();

        await refresh(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("rejects an invalid/expired token without a 500", async () => {
        (jwt.verify as any).mockImplementation(() => {
            throw new Error("jwt expired");
        });

        const req: any = { body: { token: "stale-token" } };
        const res = mockRes();

        await refresh(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("re-mints a token for a still-valid token", async () => {
        (jwt.verify as any).mockReturnValue({ id: "u1" });
        (prisma.user.findUnique as any).mockResolvedValue({ id: "u1", email: "a@b.com", role: "JOB_SEEKER" });

        const req: any = { body: { token: "valid-token" } };
        const res = mockRes();

        await refresh(req, res, next);

        expect(res.json).toHaveBeenCalledWith({ token: "signed-token", user: { id: "u1", email: "a@b.com", role: "JOB_SEEKER" } });
    });
});
