import { getCollection, type FavoriteDocument } from "@/lib/mongo/client";
import { MONGODB_FAVORITES_COLLECTION } from "@/lib/config";

export async function listFavorites(userId: string): Promise<string[]> {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    MONGODB_FAVORITES_COLLECTION
  );
  const docs = await favoritesCollection.find({ userId }).toArray();
  return docs.map((doc) => doc.productId);
}

export async function isProductFavorited(
  userId: string,
  productId: string
): Promise<boolean> {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    MONGODB_FAVORITES_COLLECTION
  );
  const favorite = await favoritesCollection.findOne({ userId, productId });
  return Boolean(favorite);
}

export async function addFavorite(userId: string, productId: string) {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    MONGODB_FAVORITES_COLLECTION
  );
  await favoritesCollection.updateOne(
    { userId, productId },
    { $setOnInsert: { userId, productId, createdAt: new Date() } },
    { upsert: true }
  );
}

export async function removeFavorite(userId: string, productId: string) {
  const favoritesCollection = await getCollection<FavoriteDocument>(
    MONGODB_FAVORITES_COLLECTION
  );
  await favoritesCollection.deleteOne({ userId, productId });
}

