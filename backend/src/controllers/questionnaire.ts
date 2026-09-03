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
