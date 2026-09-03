import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

// 70% of the 1000 max points across the 100 seeded questions.
const CERTIFICATION_THRESHOLD = 700;

/**
 * Controller: Get the list of questions
 * @route GET /api/questionnaire/questions
 * @access Private
 */
export const getAllQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const questions = await prisma.question.findMany({
            where: { isActive: true },
            include: {
                options: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
        return res.status(200).json(questions);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Get the candidate progression
 * @route GET /api/questionnaire/progression
 * @access Private
 */
export const getCandidateProgression = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // The JWT only carries { id, role } — the profile isn't attached to
        // req.body.user by the auth middleware, so it has to be looked up here.
        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const progression = await prisma.questionnaireProgress.findUnique({
            where: { profileId: profile.id },
        });
        return res.status(200).json(progression);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Save the candidate progression
 * @route POST /api/questionnaire/progression
 * @access Private
 */
export const saveCandidateProgression = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { answers, questionnaireVersion } = req.body;
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const progression = await prisma.questionnaireProgress.upsert({
            where: { profileId: profile.id },
            update: {
                answers,
                ...(questionnaireVersion !== undefined ? { questionnaireVersion } : {}),
            },
            create: {
                profileId: profile.id,
                answers,
                ...(questionnaireVersion !== undefined ? { questionnaireVersion } : {}),
            },
        });
        return res.status(200).json(progression);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Submit the questionnaire for final scoring
 * @route POST /api/questionnaire/submit
 * @access Private
 */
export const submitQuestionnaire = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { answers } = req.body;
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const selectedOptionIds = Object.values(answers) as string[];

        const selectedOptions = await prisma.option.findMany({
            where: {
                id: {
                    in: selectedOptionIds,
                },
            },
            select: {
                points: true,
            },
        });

        const totalScore = selectedOptions.reduce((sum, opt) => sum + opt.points, 0);
        const hasCertification = totalScore >= CERTIFICATION_THRESHOLD;

        await prisma.profile.update({
            where: {
                id: profile.id,
            },
            data: {
                certificationScore: totalScore,
                hasWorkPermit: hasCertification,
            },
        });

        await prisma.questionnaireResult.upsert({
            where: { profileId: profile.id },
            update: { totalScore, hasPermisDeTravailler: hasCertification, completedAt: new Date() },
            create: { profileId: profile.id, totalScore, hasPermisDeTravailler: hasCertification },
        });

        await prisma.questionnaireProgress.deleteMany({
            where: {
                profileId: profile.id,
            },
        });

        return res.status(200).json({
            message: 'Questionnaire submitted successfully',
            totalScore,
            hasWorkPermit: hasCertification,
            completedAt: new Date(),
        });
    } catch (error) {
        return next(error);
    }
};
