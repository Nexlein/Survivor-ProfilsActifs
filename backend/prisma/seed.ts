import { prisma } from '../src/prisma.js';
import bcrypt from 'bcrypt';


async function main() {
  console.log('Starting database seeding...');

  console.log('Cleaning existing data...');
  await prisma.interaction.deleteMany();
  await prisma.loginLog.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionnaireProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  console.log('Creating users...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@job-et-bonheur.fr',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@techcorp.fr',
      passwordHash,
      role: 'RECRUITER',
    },
  });

  const jobSeeker1 = await prisma.user.create({
    data: {
      email: 'jean.dupont@example.com',
      passwordHash,
      role: 'JOB_SEEKER',
      dateOfBirth: new Date('1995-05-15'), // Adult
    },
  });

  const jobSeeker2 = await prisma.user.create({
    data: {
      email: 'marie.curie@example.com',
      passwordHash,
      role: 'JOB_SEEKER',
      dateOfBirth: new Date('1990-11-07'), // Adult
    },
  });

  console.log('Creating skills...');
  const skillReact = await prisma.skill.create({ data: { name: 'React' } });
  const skillNode = await prisma.skill.create({ data: { name: 'Node.js' } });
  const skillManagement = await prisma.skill.create({ data: { name: 'Management' } });

  console.log('Creating profiles and videos...');

  await prisma.profile.create({
    data: {
      userId: jobSeeker1.id,
      fullName: 'Jean Dupont',
      targetSector: 'Web Development',
      location: 'Paris, France',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      hasWorkPermit: true,
      skills: {
        connect: [{ id: skillReact.id }, { id: skillNode.id }],
      },
      videos: {
        create: [
          {
            type: 'LINK',
            url: 'https://example.com/videos/jean-intro.mp4',
            subtitleUrl: 'https://example.com/videos/jean-intro.vtt',
            likes: 15,
            views: 120,
            consentDate: new Date(),
            consentTextVersion: 'v1.0 - 2026-09-01',
            status: 'APPROVED',
          },
        ],
      },
    },
  });

  await prisma.profile.create({
    data: {
      userId: jobSeeker2.id,
      fullName: 'Marie Curie',
      targetSector: 'Research & Development',
      location: 'Lyon, France',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      hasWorkPermit: true,
      skills: {
        connect: [{ id: skillManagement.id }],
      },
      videos: {
        create: [
          {
            type: 'UPLOAD',
            url: '/uploads/marie-curie-pitch.mp4',
            subtitleUrl: '/uploads/marie-curie-pitch.vtt',
            likes: 42,
            views: 350,
            consentDate: new Date(),
            consentTextVersion: 'v1.0 - 2026-09-01',
            status: 'APPROVED',
          },
        ],
      },
    },
  });

  console.log('Creating questionnaire...');

  const q1 = await prisma.question.create({
    data: {
      text: "Quelle est la principale qualité d'un bon leader ?",
      weighting: 2,
      options: {
        create: [
          { text: "L'autorité", isCorrect: false },
          { text: "L'écoute", isCorrect: true },
          { text: "La vitesse", isCorrect: false },
        ],
      },
    },
  });

  const q2 = await prisma.question.create({
    data: {
      text: "Que faire en cas de conflit dans une équipe ?",
      weighting: 3,
      options: {
        create: [
          { text: "Ignorer le problème", isCorrect: false },
          { text: "Prendre parti immédiatement", isCorrect: false },
          { text: "Organiser une médiation", isCorrect: true },
        ],
      },
    },
  });

  console.log('Seeding finished successfully!');
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
