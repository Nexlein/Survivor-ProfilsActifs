import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import fs from 'fs';

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

        const whereClause: any = {
            profileId: user.profile.id
        };
        const progression = await prisma.questionnaireProgress.findFirst({
            where: whereClause,
            orderBy: { lastSavedAt: 'desc' },
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

        const whereClause: any = {
            profileId: user.profile.id
        };
        const progression = await prisma.questionnaireProgress.upsert({
            where: whereClause,
            update: {
                ...req.body,
                lastSavedAt: new Date(),
            },
            create: {
                ...req.body,
                profileId: user.profile.id,
                lastSavedAt: new Date(),
            },
        });
        return res.status(200).json(progression);
    } catch (error) {
        return next(error);
    }
};

export const submitQuestionnaire = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user || !user.profile) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { answers } = req.body;

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Invalid answers format' });
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
        // const hasCertification = totalScore >= THRESHOLD_VALUE;

        await prisma.profile.update({
            where: {
                id: user.profile.id,
            },
            data: {
                certificationScore: totalScore,
                // hasWorkPermit: hasCertification,
            },
        });

        await prisma.questionnaireProgress.deleteMany({
            where: {
                profileId: user.profile.id,
            },
        });

        return res.status(200).json({
            message: 'Questionnaire submitted successfully',
            totalScore,
            completedAt: new Date(),
        });
    } catch (error) {
        return next(error);
    }
};
