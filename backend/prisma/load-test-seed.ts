import fs from 'fs';
import os from 'os';
import path from 'path';
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

  for (let i = 1; i <= 300; i++) {
    const profileId = `profile_${i}`; // Attach to first 300 candidates

    // LocalVideoProvider.store() copies from a real disk path (the shape
    // Multer's disk storage actually produces) — a buffer-only mock throws.
    // Write the mock content to a real temp file so this goes through the
    // provider interface exactly as production upload requests would.
    const tmpPath = path.join(os.tmpdir(), `load-test-video-${i}.mp4`);
    fs.writeFileSync(tmpPath, Buffer.from('mock video content'));
    const mockFile = {
      path: tmpPath,
      originalname: 'video.mp4',
      mimetype: 'video/mp4',
      size: 1024,
    } as any;

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
