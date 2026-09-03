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
