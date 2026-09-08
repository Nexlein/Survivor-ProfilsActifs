import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { getQuestionnaire, getCurrentVersion } from '../utils/questionnaireLoader';

// 70% of the 1000 max points across the 100 seeded questions.
const CERTIFICATION_THRESHOLD = 700;

export const getAllQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Return the JSON loaded in memory
        const questionnaire = getQuestionnaire();
        return res.status(200).json(questionnaire.questions);
    } catch (error) {
        return next(error);
    }
};

export const getCandidateProgression = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        let progression = await prisma.questionnaireProgress.findUnique({
            where: { profileId: profile.id },
        });

        const currentVersion = getCurrentVersion();

        // If progression older/different version of the JSON questionnaire,
        // Obsolete destroy it and force to start over.
        if (progression && progression.questionnaireVersion !== currentVersion) {
            await prisma.questionnaireProgress.delete({
                where: { id: progression.id }
            });
            progression = null;
        }

        return res.status(200).json(progression);
    } catch (error) {
        return next(error);
    }
};

export const saveCandidateProgression = async (req: Request, res: Response, next: NextFunction) => {
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

        const currentVersion = getCurrentVersion();

        const progression = await prisma.questionnaireProgress.upsert({
            where: { profileId: profile.id },
            update: {
                answers,
                questionnaireVersion: currentVersion,
            },
            create: {
                profileId: profile.id,
                answers,
                questionnaireVersion: currentVersion,
            },
        });
        return res.status(200).json(progression);
    } catch (error) {
        return next(error);
    }
};

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

        const currentVersion = getCurrentVersion();
        const questionnaire = getQuestionnaire();

        let totalScore = 0;

        // Iterate through all questions to calculate points using the memory JSON
        for (const question of questionnaire.questions) {
            const selectedOptionId = answers[question.id];
            if (selectedOptionId) {
                const selectedOption = question.options.find(o => o.id === selectedOptionId);
                if (selectedOption) {
                    totalScore += selectedOption.points * question.weighting;
                }
            }
        }

        const hasCertification = totalScore >= CERTIFICATION_THRESHOLD;

        await prisma.profile.update({
            where: {
                id: profile.id,
            },
            data: {
                certificationScore: totalScore,
                hasCertificationBadge: hasCertification,
            },
        });

        await prisma.questionnaireResult.upsert({
            where: { profileId: profile.id },
            update: {
                totalScore,
                hasCertificationBadge: hasCertification,
                questionnaireVersion: currentVersion,
                completedAt: new Date()
            },
            create: {
                profileId: profile.id,
                totalScore,
                hasCertificationBadge: hasCertification,
                questionnaireVersion: currentVersion
            },
        });

        await prisma.questionnaireProgress.deleteMany({
            where: {
                profileId: profile.id,
            },
        });

        return res.status(200).json({
            message: 'Questionnaire submitted successfully',
            totalScore,
            hasCertificationBadge: hasCertification,
            completedAt: new Date(),
        });
    } catch (error) {
        return next(error);
    }
};
