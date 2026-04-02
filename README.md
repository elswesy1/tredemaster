# TradeMaster - Professional Trading Platform

A comprehensive bilingual (Arabic/English) trading management platform with RTL support.

## Features

- **Portfolio Management**: Track your trading accounts and portfolio performance
- **Risk Management**: Advanced risk calculations and monitoring
- **Trading Management**: Unified interface for trades and strategies
- **Trading Journal**: Document your trades with emotions and insights
- **Psychology Tracking**: Monitor your mental state during trading
- **Statistics & Analytics**: Comprehensive performance analysis
- **AI Assistant**: AI-powered trading insights

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Prisma ORM
- PostgreSQL (Neon.tech)
- Vercel Deployment

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL="your-neon-postgresql-url"
JWT_SECRET="your-jwt-secret"
```

## License

MIT
