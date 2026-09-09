// --- 1. Core Node.js & Environment ---
import 'dotenv/config'; // Loads environment variables (must be first)
import path from 'path'; // Utilities for file and directory paths

// --- 2. Express Framework & Middlewares ---
import express from 'express'; // Core web framework
import cors from 'cors'; // Cross-Origin Resource Sharing (allows frontend access)
import helmet from 'helmet'; // HTTP response headers for security

// --- 3. Documentation (Swagger/OpenAPI) ---
import swaggerUi from 'swagger-ui-express'; // Serves the Swagger UI interface
import YAML from 'yamljs'; // Parses the swagger.yaml definition file

// --- 4. Internal Modules ---
import routes from './routes'; // Main router aggregating all endpoints
import { errorHandler } from './middlewares/error'; // Global error handler
import { getEnv } from './utils/env';

// Fail fast if required secrets/config are missing rather than booting with
// an undefined JWT_SECRET or DATABASE_URL.
getEnv();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3001' }));
app.use(express.json()); // Parses incoming JSON payloads

// Profile photos are served directly (unlike videos, which stay behind the
// authenticated /media streaming route for legal/consent reasons) since
// public profile pages display them without an auth header. helmet()'s
// default Cross-Origin-Resource-Policy: same-origin would otherwise make
// the browser (not curl — this is a browser-enforced policy) silently
// refuse to render them on the frontend's different origin/port.
app.use('/uploads/avatars', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(__dirname, '../uploads/avatars')));

// OpenAPI / Swagger Setup
// Satisfies the strict IT constraint to have Swagger UI accessible.
const swaggerDocument = YAML.load(path.resolve(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount all API routes
app.use('/', routes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

// Validate and load the versioned JSON questionnaire
import { loadQuestionnaire } from './utils/questionnaireLoader';
loadQuestionnaire();

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
