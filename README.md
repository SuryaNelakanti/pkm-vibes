# Artemis - AI-Powered Knowledge Management System

Artemis is a modern knowledge management system that combines the power of bi-directional linking, AI assistance, and structured data to help you organize and explore your knowledge.

## Features

- 🔗 Bi-Directional Linking and Knowledge Graph
- 📝 Outliner and Document Flexibility
- 🗃️ Structured Data and Databases
- 🔍 Full-Text and Embedding Search
- 🤖 AI-Powered Tagging and Organization
- ✍️ AI-Assisted Content Creation and Editing
- 💬 "Ask Your Notes" Chatbot
- 📱 Cross-Platform Support
- 🔌 Extensibility and Plugin System

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Prisma (Database ORM)
- Elasticsearch (Full-text search)
- OpenAI API (AI features)
- D3.js (Knowledge Graph visualization)

## Project Structure

```
src/
  ├── app/             # Next.js app router pages
  ├── components/      # React components
  ├── lib/            # Utility functions and shared logic
  ├── services/       # External service integrations
  ├── types/          # TypeScript type definitions
  └── styles/         # Global styles and Tailwind config
prisma/
  └── schema.prisma   # Database schema
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
