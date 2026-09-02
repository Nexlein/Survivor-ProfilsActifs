import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

/**
 * Controller: User Login
 * @route POST /auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET || 'dev-secret';
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '24h' });

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.profile,
            }
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: User Registration (with Legal Age Verification: >= 16 years)
 * @route POST /auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, role, fullName, dateOfBirth } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password and fullName are required' });
        }

        // Legal Requirement: Age verification (>= 16 years)
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const ageDate = new Date(Date.now() - dob.getTime());
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (age < 16) {
                return res.status(422).json({ error: 'Inscription interdite aux moins de 16 ans' });
            }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userRole = role === 'RECRUITER' ? 'RECRUITER' : 'JOB_SEEKER';

        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: userRole,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                profile: {
                    create: {
                        fullName,
                    }
                },
            },
            select: {
                id: true,
                email: true,
                role: true,
                dateOfBirth: true,
                createdAt: true,
                profile: true,
            }
        });

        return res.status(201).json({ message: 'Compte créé avec succès', user: newUser });
    } catch (error) {
        return next(error);
    }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        return res.json({ ...user, profile });
    } catch (error) {
        return next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.json({ message: 'Logout successful' });
    } catch (error) {
        return next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).id } });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const newToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '24h' });
        return res.json({ token: newToken, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        return next(error);
    }
};
