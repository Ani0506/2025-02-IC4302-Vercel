# Vercel UI

This Next.js 16 project now uses Firebase Authentication + Firestore (for user metadata) alongside MongoDB Atlas (for product and favorites data). API routes under `app/api` expose the Mongo-backed catalog and favorites endpoints, while Firebase session cookies secure authenticated pages.

## Getting Started

1. Install dependencies (after updating `pnpm-lock.yaml`): \
   `pnpm install`
2. Populate a `.env.local` file with the variables listed below.
3. Run the development server with `pnpm dev`.

## Required Environment Variables

| Scope           | Variable                                   | Description                                                |
| --------------- | ------------------------------------------ | ---------------------------------------------------------- |
| Client & Server | `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase web API key                                       |
|                 | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                                       |
|                 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID                                        |
|                 | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                                    |
|                 | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                               |
|                 | `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID                                            |
| (optional)      | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | Analytics measurement ID                                   |
| Server          | `FIREBASE_PROJECT_ID`                      | Service account project ID                                 |
|                 | `FIREBASE_CLIENT_EMAIL`                    | Service account client email                               |
|                 | `FIREBASE_PRIVATE_KEY`                     | Service account private key (escape newlines as `\n`)      |
|                 | `MONGODB_URI`                              | MongoDB Atlas connection string                            |
| (optional)      | `MONGODB_DB_NAME`                          | Database name (defaults to `ic4302`)                       |
| (optional)      | `MONGODB_PRODUCTS_COLLECTION`              | Collection for catalog documents (defaults to `documents`) |
| (optional)      | `MONGODB_FAVORITES_COLLECTION`             | Collection for favorites (defaults to `favorites`)         |

## Data Sources

- `lib/firebase/*` bootstraps Firebase SDK usage for client and server.
- `lib/mongo/*` manages connections to MongoDB Atlas and exposes typed accessors.
- `lib/server/products.ts` centralizes product and favorite operations on Mongo.

## API Overview

- `GET /api/products`: list products with optional filters (search, category, price range, sort).
- `GET /api/products/:id`: fetch a single product document.
- `GET /api/favorites`: list the authenticated user's favorite product IDs.
- `POST /api/favorites`: add a product to favorites.
- `DELETE /api/favorites?productId=...`: remove a product from favorites.
- `POST /api/session`: create a Firebase-backed session cookie from an ID token.
- `DELETE /api/session`: clear the session cookie.
