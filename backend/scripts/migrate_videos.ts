import { prisma } from '../src/prisma.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Video Migration Script (Zero Data-Loss) ---');

  // Check if Video table exists
  const tableCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Video'
    );
  `;
  if (!tableCheck[0]?.exists) {
    console.log('Table "Video" does not exist yet. Fresh installation detected. Nothing to migrate.');
    return;
  }

  // Check if url column exists (legacy format)
  const columnCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'Video' AND column_name = 'url'
    );
  `;
  if (!columnCheck[0]?.exists) {
    console.log('Column "url" does not exist. The database is already migrated or freshly created.');
    return;
  }

  // Ensure new columns exist before migrating data
  await prisma.$executeRaw`ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "providerId" TEXT;`;
  await prisma.$executeRaw`ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "providerName" TEXT;`;

  // Get total rows
  const totalRowsResult = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) FROM "Video"`;
  const totalRows = totalRowsResult[0]?.count || 0n;
  console.log(`Total videos in DB before migration: ${totalRows}`);

  // Get rows needing migration
  const videosToMigrate = await prisma.$queryRaw<{ id: string, url: string, subtitleUrl: string | null, type: string }[]>`
    SELECT id, url, "subtitleUrl", type 
    FROM "Video" 
    WHERE ("providerId" IS NULL OR "providerId" = '') AND url IS NOT NULL;
  `;

  if (videosToMigrate.length === 0) {
    console.log('No videos found requiring migration.');
    return;
  }

  console.log(`Found ${videosToMigrate.length} videos to migrate...`);

  const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'videos');
  const STORAGE_DIR = path.resolve(process.cwd(), 'storage', 'videos');

  // Ensure new storage directory exists
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  let migratedCount = 0;

  for (const video of videosToMigrate) {
    try {
      let newProviderId = '';
      let newProviderName = '';

      if (video.type === 'LINK') {
        // Convert legacy YouTube/Vimeo links to disabled 'youtube' provider
        newProviderId = 'legacy-link'; // Basic fallback for old links
        newProviderName = 'youtube';
      } else if (video.type === 'UPLOAD' && video.url) {
        // Migrate physical files
        newProviderId = randomUUID();
        newProviderName = 'local';

        const oldFileName = path.basename(video.url);
        const oldFilePath = path.join(UPLOADS_DIR, oldFileName);
        const newExt = path.extname(oldFileName) || '.mp4';
        const newFilePath = path.join(STORAGE_DIR, `${newProviderId}${newExt}`);

        if (fs.existsSync(oldFilePath)) {
          fs.copyFileSync(oldFilePath, newFilePath);
          // Keeping old file until we are sure, cron will delete orphans later.
        } else {
          console.log(`[Warning] Physical video file not found for ${video.id}: ${oldFilePath}`);
        }

        if (video.subtitleUrl) {
          const oldSubName = path.basename(video.subtitleUrl);
          const oldSubPath = path.join(UPLOADS_DIR, oldSubName);
          const newSubPath = path.join(STORAGE_DIR, `${newProviderId}.vtt`);

          if (fs.existsSync(oldSubPath)) {
            fs.copyFileSync(oldSubPath, newSubPath);
          }
        }
      }

      // Update the database record using raw SQL to bypass Prisma Client restrictions
      await prisma.$executeRaw`
        UPDATE "Video" 
        SET "providerId" = ${newProviderId}, 
            "providerName" = ${newProviderName},
            "type" = 'UPLOAD'::"VideoType"
        WHERE id = ${video.id};
      `;

      migratedCount++;
    } catch (err) {
      console.error(`Failed to migrate video ${video.id}:`, err);
    }
  }

  console.log(`--- Migration Complete ---`);
  console.log(`Total rows processed successfully: ${migratedCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
