import {
  MongoClient,
  type Collection,
  type Db,
  type Document,
  ObjectId,
} from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function ensureMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGODB_URI environment variable."
    );
  }
  return uri;
}

const databaseName = process.env.MONGODB_DB_NAME ?? "ic4302";

let mongoClientPromise: Promise<MongoClient>;

if (global._mongoClientPromise) {
  mongoClientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(ensureMongoUri());
  mongoClientPromise = client.connect();

  if (process.env.NODE_ENV !== "production") {
    global._mongoClientPromise = mongoClientPromise;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  return mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(databaseName);
}

export async function getCollection<TSchema extends Document>(
  name: string
): Promise<Collection<TSchema>> {
  const db = await getMongoDb();
  return db.collection<TSchema>(name);
}

export { ObjectId };

export interface ProductDocument extends Document {
  _id: ObjectId;
  id?: string;
  Title: string;
  Description?: string;
  url?: string;
  ASIN?: string;
  Publisher?: string;
  ["Publication date"]?: string;
  Edition?: string;
  Language?: string;
  ["File size"]?: string;
  ["Print length"]?: string;
  ["Best Sellers Rank"]?: string;
  ["Customer Reviews"]?: string;
  entities?: string[];
  image_url?: string;
  category?: string;
  price?: number;
  original_price?: number | null;
  in_stock?: boolean;
  rating?: number;
  review_count?: number;
}

export interface FavoriteDocument extends Document {
  _id: ObjectId;
  userId: string;
  productId: string;
  createdAt: Date;
}
