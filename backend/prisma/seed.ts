import { prisma } from '../src/prisma.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

type QuestionSeedOption = {
  id: string;
  text: string;
  points: number;
};

type QuestionSeed = {
  id: string;
  type: string;
  text: string;
  weighting: number;
  options: QuestionSeedOption[];
};

const FIRST_NAMES = ['Jean', 'Marie', 'Luc', 'Sophie', 'Thomas', 'Emma', 'Nicolas', 'Julie', 'Pierre', 'Alice', 'Antoine', 'Camille', 'Julien', 'Chloe', 'Maxime', 'Sarah', 'Alexandre', 'Laura', 'Guillaume', 'Marion'];
const LAST_NAMES = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];
const SECTORS = ['Web Development', 'Data Science', 'Marketing', 'Finance', 'Healthcare', 'Sales', 'Design', 'Engineering', 'Human Resources', 'Education'];
const LOCATIONS = ['Paris, France', 'Lyon, France', 'Marseille, France', 'Bordeaux, France', 'Lille, France', 'Toulouse, France', 'Nantes, France', 'Strasbourg, France', 'Rennes, France', 'Montpellier, France'];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('Starting database seeding...');

  const questionsSeedPath = path.resolve(process.cwd(), '../certification/questions.v1.json');
  const questionnaireData = JSON.parse(fs.readFileSync(questionsSeedPath, 'utf8'));
  const questionnaireSeeds = questionnaireData.questions as QuestionSeed[];

  console.log('Cleaning existing data...');
  await prisma.interaction.deleteMany();
  await prisma.loginLog.deleteMany();
  await prisma.questionnaireProgress.deleteMany();
  await prisma.questionnaireResult.deleteMany();
  await prisma.video.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  console.log('Creating Admin & Recruiters...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@job-et-bonheur.fr',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const recruiter1 = await prisma.user.create({
    data: {
      email: 'recruiter@techcorp.fr',
      passwordHash,
      role: 'RECRUITER',
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: 'recrutement@startup-nation.fr',
      passwordHash,
      role: 'RECRUITER',
    },
  });

  console.log('Creating skills...');
  const skillNames = ['React', 'Node.js', 'Management', 'Python', 'SEO', 'Figma', 'Docker', 'AWS', 'Communication', 'Agile'];
  const skills = [];
  for (const name of skillNames) {
    const s = await prisma.skill.create({ data: { name } });
    skills.push(s);
  }

  const TOTAL_CANDIDATES = parseInt(process.env.SEED_CANDIDATE_COUNT || '25', 10);
  const adultsCutoff = Math.max(20, Math.round(TOTAL_CANDIDATES * 0.8));
  const minorsCutoff = Math.max(adultsCutoff + 3, Math.round(TOTAL_CANDIDATES * 0.92));

  console.log(`Creating ${TOTAL_CANDIDATES}+ Candidates...`);
  // We need at least 25 candidates to test pagination (20 per page).
  let firstProfileId: string | null = null;
  let secondProfileId: string | null = null;

  for (let i = 1; i <= TOTAL_CANDIDATES; i++) {
    const firstName = getRandom(FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

    // RGPD scenarios:
    // 20 Adults (>= 18)
    // 3 Minors (16-18) - hidden from public, visible to recruiters
    // 2 Ghosts (No age / visible=false) - completely hidden
    let dob: Date | null = new Date(`1990-01-01`); // Default adult
    let isVisible = true;
    let status: 'APPROVED' | 'PENDING' | 'REJECTED' = 'APPROVED'; // seeded video's moderation status
    // Account-level moderation status (admin validation queue) — independent
    // of the video's own status above.
    let accountModerationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' = 'APPROVED';

    if (i > adultsCutoff && i <= minorsCutoff) {
      // Minor (17 years old)
      const minorDate = new Date();
      minorDate.setFullYear(minorDate.getFullYear() - 17);
      dob = minorDate;
    } else if (i > minorsCutoff) {
      // Ghost (No age, explicitly hidden) — an incomplete signup still
      // awaiting admin validation.
      dob = null;
      isVisible = false;
      status = 'PENDING';
      accountModerationStatus = 'PENDING';
    }

    // Randomize some statuses for adults
    if (i % 5 === 0 && i <= adultsCutoff) status = 'PENDING';
    if (i % 7 === 0 && i <= adultsCutoff) status = 'REJECTED';
    if (i % 4 === 0 && i <= adultsCutoff) accountModerationStatus = 'PENDING';
    if (i === adultsCutoff) accountModerationStatus = 'SUSPENDED';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'JOB_SEEKER',
        dateOfBirth: dob,
        moderationStatus: accountModerationStatus,
      },
    });

    // Random 2 to 4 skills
    const userSkills = [...skills].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        fullName: `${firstName} ${lastName}`,
        targetSector: getRandom(SECTORS),
        location: getRandom(LOCATIONS),
        avatarUrl: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i % 50}.jpg`,
        hasCertificationBadge: true,
        visible: isVisible,
        skills: {
          connect: userSkills.map(s => ({ id: s.id })),
        },
        videos: {
          create: [
            {
              type: 'UPLOAD',
              providerId: 'seed-demo-video-1',
              providerName: 'local',
              consentDate: new Date(),
              consentTextVersion: 'v1.0 - 2026-09-01',
              status: status,
            },
          ],
        },
      },
    });
    if (!firstProfileId) {
      firstProfileId = profile.id;
    } else if (!secondProfileId) {
      secondProfileId = profile.id;
    }
  }

  const firstQuestion = questionnaireSeeds[0];
  if (!firstQuestion) {
    throw new Error('No questionnaire seeds found');
  }
  if (!firstProfileId || !secondProfileId) {
    throw new Error('Not enough seeded profiles for questionnaire fixtures');
  }

  await prisma.questionnaireProgress.create({
    data: {
      profileId: firstProfileId,
      questionnaireVersion: 1,
      answers: {
        [firstQuestion.id]: firstQuestion.options[1].id,
      },
    },
  });

  const totalScore = questionnaireSeeds.reduce((score, question) => {
    const bestOption = question.options.reduce((best, option) => (option.points > best.points ? option : best));
    return score + bestOption.points;
  }, 0);

  await prisma.questionnaireResult.create({
    data: {
      profileId: secondProfileId,
      totalScore,
      hasCertificationBadge: true,
    },
  });

  console.log(`Seeding finished successfully! ${TOTAL_CANDIDATES} Candidates created.`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
