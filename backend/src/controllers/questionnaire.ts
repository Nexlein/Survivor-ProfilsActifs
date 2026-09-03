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

/**
 * Controller: Submit the questionnaire for scoring
 * @route POST /api/questionnaire/submit
 * @access Private
 */
export const submitQuestionnaire = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

        const totalScore = answers.reduce((sum: number, answer: any) => {
            if (!answer) return sum;

            if (typeof answer.score === 'number') {
                return sum + answer.score;
            }

            if (answer.option && typeof answer.option.score === 'number') {
                return sum + answer.option.score;
            }

            if (answer.selectedOption && typeof answer.selectedOption.score === 'number') {
                return sum + answer.selectedOption.score;
            }

            if (Array.isArray(answer.options)) {
                const optionScore = answer.options.reduce((optionSum: number, option: any) => {
                    if (option?.selected === true && typeof option?.score === 'number') {
                        return optionSum + option.score;
                    }
                    return optionSum;
                }, 0);
                return sum + optionScore;
            }
            return sum;
        }, 0);

        return res.status(200).json({
            message: 'Questionnaire submitted successfully',
            score: totalScore,
        });
    } catch (error) {
        return next(error);
    }
};
