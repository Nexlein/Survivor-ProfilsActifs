import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/prisma", () => {
    const prisma = {
        profile: { findUnique: vi.fn(), update: vi.fn() },
        questionnaireProgress: { findUnique: vi.fn(), upsert: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
        questionnaireResult: { upsert: vi.fn() },
    };
    return { default: prisma, prisma };
});

vi.mock("../../src/utils/questionnaireLoader", () => ({
    getCurrentVersion: vi.fn().mockReturnValue(1),
    getQuestionnaire: vi.fn(),
}));

import prisma from "../../src/prisma";
import { getQuestionnaire, getCurrentVersion } from "../../src/utils/questionnaireLoader";
import { submitQuestionnaire, getCandidateProgression } from "../../src/controllers/questionnaire";

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const next = vi.fn();

const sampleQuestionnaire = {
    version: 1,
    questions: [
        {
            id: "q1",
            text: "Q1",
            type: "MULTIPLE_CHOICE",
            weighting: 5,
            options: [
                { id: "q1-a", text: "A", points: 10 },
                { id: "q1-b", text: "B", points: 0 },
            ],
        },
        {
            id: "q2",
            text: "Q2",
            type: "MULTIPLE_CHOICE",
            weighting: 3,
            options: [
                { id: "q2-a", text: "A", points: 20 },
                { id: "q2-b", text: "B", points: 0 },
            ],
        },
    ],
};

beforeEach(() => {
    vi.clearAllMocks();
    (getQuestionnaire as any).mockReturnValue(sampleQuestionnaire);
    (getCurrentVersion as any).mockReturnValue(1);
    (prisma.profile.findUnique as any).mockResolvedValue({ id: "p1" });
    (prisma.profile.update as any).mockResolvedValue({});
    (prisma.questionnaireResult.upsert as any).mockResolvedValue({});
    (prisma.questionnaireProgress.deleteMany as any).mockResolvedValue({});
});

describe("submitQuestionnaire — scoring", () => {
    it("sums points * weighting across answered questions", async () => {
        // q1-a: 10 * 5 = 50, q2-a: 20 * 3 = 60 -> total 110
        const req: any = { body: { user: { id: "u1" }, answers: { q1: "q1-a", q2: "q2-a" } } };
        const res = mockRes();

        await submitQuestionnaire(req, res, next);

        expect(prisma.profile.update).toHaveBeenCalledWith({
            where: { id: "p1" },
            data: { certificationScore: 110, hasCertificationBadge: false },
        });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ totalScore: 110, hasCertificationBadge: false })
        );
    });

    it("ignores an unanswered question and an answer referencing an unknown option", async () => {
        const req: any = { body: { user: { id: "u1" }, answers: { q1: "not-a-real-option" } } };
        const res = mockRes();

        await submitQuestionnaire(req, res, next);

        expect(prisma.profile.update).toHaveBeenCalledWith({
            where: { id: "p1" },
            data: { certificationScore: 0, hasCertificationBadge: false },
        });
    });

    it("awards the certification badge at or above the threshold", async () => {
        // q1-a: 10*5=50, need total >= 700. Bump option points to hit threshold.
        const bigQuestionnaire = {
            version: 1,
            questions: [
                { id: "q1", text: "Q1", type: "MULTIPLE_CHOICE", weighting: 10, options: [{ id: "q1-a", text: "A", points: 70 }] },
            ],
        };
        (getQuestionnaire as any).mockReturnValue(bigQuestionnaire);

        const req: any = { body: { user: { id: "u1" }, answers: { q1: "q1-a" } } };
        const res = mockRes();

        await submitQuestionnaire(req, res, next);

        // 70 * 10 = 700 -> exactly the threshold
        expect(prisma.profile.update).toHaveBeenCalledWith({
            where: { id: "p1" },
            data: { certificationScore: 700, hasCertificationBadge: true },
        });
    });

    it("clears saved progress after a successful submission", async () => {
        const req: any = { body: { user: { id: "u1" }, answers: {} } };
        const res = mockRes();

        await submitQuestionnaire(req, res, next);

        expect(prisma.questionnaireProgress.deleteMany).toHaveBeenCalledWith({ where: { profileId: "p1" } });
    });

    it("rejects a request with no answers object", async () => {
        const req: any = { body: { user: { id: "u1" } } };
        const res = mockRes();

        await submitQuestionnaire(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.profile.update).not.toHaveBeenCalled();
    });
});

describe("getCandidateProgression — version invalidation", () => {
    it("discards saved progress from a stale questionnaire version", async () => {
        (prisma.questionnaireProgress.findUnique as any).mockResolvedValue({
            id: "prog1",
            profileId: "p1",
            questionnaireVersion: 0,
        });
        (prisma.questionnaireProgress.delete as any).mockResolvedValue({});

        const req: any = { body: { user: { id: "u1" } } };
        const res = mockRes();

        await getCandidateProgression(req, res, next);

        expect(prisma.questionnaireProgress.delete).toHaveBeenCalledWith({ where: { id: "prog1" } });
        expect(res.json).toHaveBeenCalledWith(null);
    });

    it("keeps progress that matches the current version", async () => {
        const progress = { id: "prog1", profileId: "p1", questionnaireVersion: 1 };
        (prisma.questionnaireProgress.findUnique as any).mockResolvedValue(progress);

        const req: any = { body: { user: { id: "u1" } } };
        const res = mockRes();

        await getCandidateProgression(req, res, next);

        expect(prisma.questionnaireProgress.delete).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(progress);
    });
});
