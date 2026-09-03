import { prisma } from '../src/prisma.js';
import bcrypt from 'bcrypt';

const FIRST_NAMES = ['Jean', 'Marie', 'Luc', 'Sophie', 'Thomas', 'Emma', 'Nicolas', 'Julie', 'Pierre', 'Alice', 'Antoine', 'Camille', 'Julien', 'Chloe', 'Maxime', 'Sarah', 'Alexandre', 'Laura', 'Guillaume', 'Marion'];
const LAST_NAMES = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];
const SECTORS = ['Web Development', 'Data Science', 'Marketing', 'Finance', 'Healthcare', 'Sales', 'Design', 'Engineering', 'Human Resources', 'Education'];
const LOCATIONS = ['Paris, France', 'Lyon, France', 'Marseille, France', 'Bordeaux, France', 'Lille, France', 'Toulouse, France', 'Nantes, France', 'Strasbourg, France', 'Rennes, France', 'Montpellier, France'];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

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

  console.log('Creating 25+ Candidates...');
  // We need exactly 25 candidates to test pagination (20 per page).

  for (let i = 1; i <= 25; i++) {
    const firstName = getRandom(FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

    // RGPD scenarios:
    // 20 Adults (>= 18)
    // 3 Minors (16-18) - hidden from public, visible to recruiters
    // 2 Ghosts (No age / visible=false) - completely hidden
    let dob: Date | null = new Date(`1990-01-01`); // Default adult
    let isVisible = true;
    let status: 'APPROVED' | 'PENDING' | 'REJECTED' = 'APPROVED';

    if (i > 20 && i <= 23) {
      // Minor (17 years old)
      const minorDate = new Date();
      minorDate.setFullYear(minorDate.getFullYear() - 17);
      dob = minorDate;
    } else if (i > 23) {
      // Ghost (No age, explicitly hidden)
      dob = null;
      isVisible = false;
      status = 'PENDING';
    }

    // Randomize some statuses for adults
    if (i % 5 === 0 && i <= 20) status = 'PENDING';
    if (i % 7 === 0 && i <= 20) status = 'REJECTED';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'JOB_SEEKER',
        dateOfBirth: dob,
      },
    });

    // Random 2 to 4 skills
    const userSkills = [...skills].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);

    await prisma.profile.create({
      data: {
        userId: user.id,
        fullName: `${firstName} ${lastName}`,
        targetSector: getRandom(SECTORS),
        location: getRandom(LOCATIONS),
        avatarUrl: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i % 50}.jpg`,
        hasWorkPermit: true,
        visible: isVisible,
        skills: {
          connect: userSkills.map(s => ({ id: s.id })),
        },
        videos: {
          create: [
            {
              type: 'LINK',
              url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Safe sample video
              subtitleUrl: null,
              consentDate: new Date(),
              consentTextVersion: 'v1.0 - 2026-09-01',
              status: status,
            },
          ],
        },
      },
    });
  }

  console.log('Creating questionnaire...');

  const qs = [
    { text: "Quelle est la principale qualité d'un bon leader ?", weighting: 2, opts: ["L'autorité", "L'écoute", "La vitesse"] },
    { text: "Que faire en cas de conflit dans une équipe ?", weighting: 3, opts: ["Ignorer", "Prendre parti", "Organiser une médiation"] },
    { text: "Comment gérez-vous le stress ?", weighting: 2, opts: ["Je panique", "Je m'isole", "Je planifie et priorise"] },
    { text: "Quel est le but d'un stand-up meeting ?", weighting: 1, opts: ["Se plaindre", "Faire un long bilan", "Aligner l'équipe rapidement"] },
    { text: "Comment réagissez-vous face à l'échec ?", weighting: 3, opts: ["C'est la fin", "J'accuse les autres", "J'en tire une leçon"] }
  ];

  for (const q of qs) {
    await prisma.question.create({
      data: {
        text: q.text,
        weighting: q.weighting,
        options: {
          create: q.opts.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === 2 // Making the 3rd option correct for all of them just for seeding
          }))
        }
      }
    });
  }

  console.log('Seeding finished successfully! 25+ Candidates created.');
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
