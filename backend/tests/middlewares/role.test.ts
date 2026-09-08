import { describe, it, expect, vi } from "vitest";
import { requireRole } from "../../src/middlewares/role";

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe("requireRole middleware", () => {
    it("calls next() when the request user has an allowed role", () => {
        const req: any = { user: { id: "u1", role: "ADMIN" } };
        const res = mockRes();
        const next = vi.fn();

        requireRole("ADMIN")(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("accepts any of several allowed roles", () => {
        const req: any = { user: { id: "u1", role: "RECRUITER" } };
        const res = mockRes();
        const next = vi.fn();

        requireRole("ADMIN", "RECRUITER")(req, res, next);

        expect(next).toHaveBeenCalledOnce();
    });

    it("returns 403 when the request user has a disallowed role", () => {
        const req: any = { user: { id: "u1", role: "JOB_SEEKER" } };
        const res = mockRes();
        const next = vi.fn();

        requireRole("ADMIN")(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Forbidden. Insufficient role." });
    });

    it("returns 403 when there is no authenticated user on the request", () => {
        const req: any = {};
        const res = mockRes();
        const next = vi.fn();

        requireRole("ADMIN")(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
