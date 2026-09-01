# ProfilsActifs

![Status](https://img.shields.io/badge/Status-Development-blue)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Next.js%20%7C%20Prisma-brightgreen)

Video-based professional networking platform for the Ministère du Job et Bonheur.

## Documentation

- 📖 [Installation Guide](docs/installation.md)
- 🚀 [Deployment Note](docs/deployment_note.md)
- 🏗️ [Architecture & Schema](docs/architecture.md)
- 🏢 [Project Hierarchy & Authority](docs/project_hierarchy.md)
- ⚖️ [Legal Requirements](docs/mails/exigences_juridiques.md)
- ⚙️ [Technical Constraints](docs/mails/contraintes_techniques.md)
- 🎨 [Visual Identity & Comms](docs/mails/identite_visuelle.md)
- 📢 [Comms Deliverables](docs/comms_deliverables.md)
- 🛡️ [Data Register](docs/legal_data_register.md)
- 📄 [Brief](docs/brief_jibjob_en.pdf)

## Quick Start

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Once running, the Swagger API Documentation is available at:
**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**
