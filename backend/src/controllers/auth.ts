import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { getEnv, getEnvInt } from '../utils/env';

// jsonwebtoken's expiresIn type only accepts its own branded string literals
// (e.g. "24h"), not a general `string` — this value is trusted server
// config (an env var), not user input, so the cast is safe.
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];
const BCRYPT_SALT_ROUNDS = getEnvInt('BCRYPT_SALT_ROUNDS', 10);

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
            include: { profile: { include: { skills: true } } },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET || 'dev-secret';
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: JWT_EXPIRES_IN });

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
        const {
            email, password, role, fullName, dateOfBirth,
            targetSector, location, skills,
            companyName, industry, position
        } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password and fullName are required' });
        }

        const userRole = role === 'RECRUITER' ? 'RECRUITER' : 'JOB_SEEKER';

        // dateOfBirth drives the age-verification/minor-protection logic
        // throughout the app (RGPD/legal requirement) — it can't be left out
        // for a JOB_SEEKER, since an absent value would otherwise bypass the
        // under-16 check below entirely.
        if (userRole === 'JOB_SEEKER' && !dateOfBirth) {
            return res.status(400).json({ error: 'dateOfBirth is required for job seeker registration' });
        }

        // Legal Requirement: Age verification (>= 16 years)
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const ageDate = new Date(Date.now() - dob.getTime());
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (age < 16) {
                return res.status(422).json({ error: 'Registration is prohibited for users under 16 years old' });
            }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already in use' });
        }

        if (skills && Array.isArray(skills) && skills.length > 10) {
            return res.status(400).json({ error: 'Maximum 10 skills allowed' });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const profileData: any = { fullName };

        if (userRole === 'JOB_SEEKER') {
            if (targetSector) profileData.targetSector = targetSector;
            if (location) profileData.location = location;
            if (skills && Array.isArray(skills)) {
                profileData.skills = {
                    connectOrCreate: skills.map((skillName: string) => ({
                        where: { name: skillName },
                        create: { name: skillName }
                    }))
                };
            }
        } else if (userRole === 'RECRUITER') {
            if (companyName) profileData.companyName = companyName;
            if (industry) profileData.industry = industry;
            if (position) profileData.position = position;
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: userRole,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                moderationStatus: userRole === 'JOB_SEEKER' ? 'PENDING' : 'APPROVED',
                profile: {
                    create: profileData
                },
            },
            select: {
                id: true,
                email: true,
                role: true,
                dateOfBirth: true,
                moderationStatus: true,
                createdAt: true,
                profile: {
                    include: { skills: true }
                },
            }
        });

        return res.status(201).json({ message: 'Account created successfully', user: newUser });
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
        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { skills: true }
        });
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
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, getEnv().JWT_SECRET);
        } catch {
            // An expired/invalid token here is an expected client-side
            // condition (the whole point of this endpoint), not a server
            // error — surface it as 401, not a 500 via the error middleware.
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).id } });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const newToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: JWT_EXPIRES_IN });
        return res.json({ token: newToken, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        return next(error);
    }
};
