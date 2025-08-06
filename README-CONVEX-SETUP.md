# Convex Setup Instructions

This project now uses Convex for real-time multiplayer functionality instead of Socket.IO.

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Convex:**
   ```bash
   npx convex dev
   ```
   
   This will:
   - Create a Convex project (you'll need to sign up/login)
   - Generate the API files in `convex/_generated/`
   - Give you a deployment URL
   - Start the Convex development server

3. **Set up environment variables:**
   Create a `.env.local` file and add the Convex URL you received:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Deployment

For production deployment:

1. **Deploy to Convex:**
   ```bash
   npm run convex:deploy
   ```

2. **Update your production environment variables** in Vercel with the production Convex URL.

3. **Deploy to Vercel** as usual.

## Features

- ✅ Real-time multiplayer gameplay
- ✅ Automatic player connection/disconnection handling
- ✅ Spectator mode
- ✅ Game state persistence
- ✅ Works perfectly with Vercel serverless functions
- ✅ Type-safe with full TypeScript support