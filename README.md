# AI Microservice Platform

A full-stack application built with React, Express, and TypeScript, featuring AI capabilities and modern UI components.

## 🚀 Features

- Modern React frontend with TypeScript
- Express backend with TypeScript
- Drizzle ORM for database management
- Authentication with Passport.js
- Real-time capabilities with WebSocket
- Beautiful UI with Radix UI components
- Tailwind CSS for styling
- OpenAI integration

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (via Neon)
- **Authentication**: Passport.js
- **Styling**: Tailwind CSS, Radix UI
- **Deployment**: Vercel

## 📦 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Neon database)

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd AiMicroservicePlatform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key
```

4. **Run the development server**
```bash
npm run dev
```

## 🏗️ Building for Production

```bash
npm run build
```

## 🚀 Deployment to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set up Environment Variables in Vercel**
- Go to your project in the Vercel dashboard
- Navigate to Settings > Environment Variables
- Add the following variables:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `OPENAI_API_KEY`

## 📁 Project Structure

```
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types and utilities
├── .config/          # Configuration files
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── vite.config.ts    # Vite configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── vercel.json       # Vercel deployment configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for hosting
- [Neon](https://neon.tech) for database
- [OpenAI](https://openai.com) for AI capabilities 