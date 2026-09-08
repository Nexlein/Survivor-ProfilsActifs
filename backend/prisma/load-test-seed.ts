import { prisma } from '../src/prisma';
import { ProviderFactory } from '../src/providers/ProviderFactory';

async function main() {
  console.log('Clearing existing data for load test...');
  await prisma.interaction.deleteMany();
  await prisma.video.deleteMany();
  await prisma.questionnaireResult.deleteMany();
  await prisma.questionnaireProgress.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Generating 500 users & profiles...');
  const users = [];
  const profiles = [];

  for (let i = 1; i <= 500; i++) {
    const isCandidate = i <= 400; // 400 candidates, 100 recruiters
    const user = {
      id: `user_${i}`,
      email: `user${i}@example.com`,
      passwordHash: 'hashed_password_mock',
      role: isCandidate ? 'JOB_SEEKER' : 'RECRUITER',
      dateOfBirth: new Date('1990-01-01'), // Adults
    };
    users.push(user);

    const profile = {
      id: `profile_${i}`,
      userId: `user_${i}`,
      fullName: `First${i} Last${i}`,
      visible: isCandidate,
      bio: isCandidate ? 'I am looking for a job' : null,
      companyName: !isCandidate ? 'Acme Corp' : null,
      certificationScore: isCandidate && i % 2 === 0 ? 85 : null,
      hasCertificationBadge: isCandidate && i % 2 === 0,
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
    };
    profiles.push(profile);
  }

  await prisma.user.createMany({ data: users as any });
  await prisma.profile.createMany({ data: profiles as any });

  console.log('Generating 300 videos using VideoProvider...');
  const provider = ProviderFactory.getProvider();

  // We mock an Express.Multer.File object
  const mockFile = {
    buffer: Buffer.from('mock video content'),
    originalname: 'video.mp4',
    mimetype: 'video/mp4',
    size: 1024,
  } as any;

  for (let i = 1; i <= 300; i++) {
    const profileId = `profile_${i}`; // Attach to first 300 candidates
    const providerId = await provider.store(mockFile);
    await prisma.video.create({
      data: {
        profileId,
        providerId,
        providerName: process.env.VIDEO_PROVIDER || 'local',
        type: 'UPLOAD',
        status: 'APPROVED',
      }
    });
    if (i % 50 === 0) console.log(`Created ${i} videos...`);
  }

  console.log('Load test database seeded successfully: 500 profiles, 300 videos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
