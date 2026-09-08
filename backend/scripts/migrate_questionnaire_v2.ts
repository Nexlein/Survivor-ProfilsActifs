import fs from 'fs';
import path from 'path';
import { prisma } from '../src/prisma.js';

async function main() {
  console.log('--- Starting Questionnaire v2 Migration (100 -> 20 questions) ---');

  const questionnairePath = path.resolve(process.cwd(), '../certification/questions.v1.json');
  const questionnaire = JSON.parse(fs.readFileSync(questionnairePath, 'utf8'));
  const currentVersion: number = questionnaire.version;
  console.log(`Current questionnaire version (from JSON): v${currentVersion}`);

  // Recalculation is not possible: submitQuestionnaire() deletes the raw
  // per-question answers (QuestionnaireProgress) as soon as a result is
  // recorded, so a completed QuestionnaireResult only ever has the
  // aggregate totalScore. There is no way to check whether a candidate
  // answered the 20 kept questions after the fact — invalidation is the
  // only defensible option for already-submitted results.
  const staleResults = await prisma.questionnaireResult.findMany({
    where: { questionnaireVersion: { not: currentVersion } },
    include: { profile: { select: { id: true, fullName: true, hasCertificationBadge: true } } },
  });

  const badgedBefore = await prisma.profile.count({ where: { hasCertificationBadge: true } });
  const totalResultsBefore = await prisma.questionnaireResult.count();

  console.log(`Total QuestionnaireResult rows before: ${totalResultsBefore}`);
  console.log(`Profiles with an active badge before: ${badgedBefore}`);
  console.log(`Results tied to an obsolete version (to invalidate): ${staleResults.length}`);

  if (staleResults.length === 0) {
    // Still worth clearing out any dangling in-progress rows on an old
    // version — safe no-op if there are none.
    const staleProgress = await prisma.questionnaireProgress.deleteMany({
      where: { questionnaireVersion: { not: currentVersion } },
    });
    console.log(`No stale results to invalidate. Cleared ${staleProgress.count} stale in-progress row(s).`);
    console.log('--- Migration Complete (nothing to do) ---');
    return;
  }

  let invalidatedCount = 0;

  for (const result of staleResults) {
    try {
      await prisma.$transaction([
        prisma.profile.update({
          where: { id: result.profileId },
          data: { certificationScore: null, hasCertificationBadge: false },
        }),
        prisma.questionnaireResult.delete({ where: { id: result.id } }),
      ]);
      console.log(
        `Invalidated: ${result.profile.fullName} (was v${result.questionnaireVersion}, score ${result.totalScore}, badge=${result.profile.hasCertificationBadge})`
      );
      invalidatedCount++;
    } catch (err) {
      console.error(`Failed to invalidate result ${result.id} for profile ${result.profileId}:`, err);
    }
  }

  const staleProgress = await prisma.questionnaireProgress.deleteMany({
    where: { questionnaireVersion: { not: currentVersion } },
  });

  const badgedAfter = await prisma.profile.count({ where: { hasCertificationBadge: true } });
  const totalResultsAfter = await prisma.questionnaireResult.count();

  console.log('--- Migration Complete ---');
  console.log(`Results invalidated: ${invalidatedCount}`);
  console.log(`Stale in-progress rows cleared: ${staleProgress.count}`);
  console.log(`Total QuestionnaireResult rows after: ${totalResultsAfter}`);
  console.log(`Profiles with an active badge after: ${badgedAfter} (was ${badgedBefore})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
