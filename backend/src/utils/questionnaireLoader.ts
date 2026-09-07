import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Explicite schema defined by the legal requirement
const optionSchema = z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    points: z.number().int(),
});

const questionSchema = z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    type: z.string().min(1),
    weighting: z.number().int(),
    options: z.array(optionSchema).min(2),
});

const questionnaireFileSchema = z.object({
    version: z.number().int().positive(),
    questions: z.array(questionSchema).min(1),
});

type QuestionnaireData = z.infer<typeof questionnaireFileSchema>;

let cachedQuestionnaire: QuestionnaireData | null = null;

export const loadQuestionnaire = () => {
    try {
        const filePath = path.resolve(process.cwd(), '../certification/questions.v1.json');

        if (!fs.existsSync(filePath)) {
            console.error(`[FATAL] Questionnaire file missing: ${filePath}`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsedJson = JSON.parse(fileContent);

        // This will throw a detailed ZodError if the schema is invalid
        const validatedData = questionnaireFileSchema.parse(parsedJson);

        cachedQuestionnaire = validatedData;
        console.log(`[BOOT] Questionnaire v${validatedData.version} successfully loaded into memory.`);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('[FATAL] Invalid questionnaire JSON format!');
            console.error('Validation errors:', JSON.stringify(error.issues, null, 2));
        } else {
            console.error('[FATAL] Failed to read or parse questionnaire JSON:', error);
        }
        process.exit(1);
    }
};

export const getQuestionnaire = (): QuestionnaireData => {
    if (!cachedQuestionnaire) {
        loadQuestionnaire();
    }
    return cachedQuestionnaire!;
};

export const getCurrentVersion = (): number => {
    return getQuestionnaire().version;
};
