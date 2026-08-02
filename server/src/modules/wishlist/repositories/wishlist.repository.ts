import { Types } from 'mongoose';
import { IWishlist } from '../interfaces/wishlist.interface';
import { IWishlistRepository } from '../interfaces/wishlist-repository.interface';
import WishlistModel, { IWishlistDocument } from '../models/wishlist.model';

/**
 * Enterprise Wishlist Repository Implementation.
 * 
 * Handles all database interactions for the Wishlist aggregate using Mongoose.
 * Adheres strictly to the Single Responsibility Principle (SRP) and Repository Pattern.
 * Exposes plain domain representations (IWishlist) to prevent database driver leakage.
 */
export class WishlistRepository implements IWishlistRepository {
  /**
   * Helper method to map a raw Mongoose document/lean object to the IWishlist domain interface.
   */
  private mapToDomain(doc: any): IWishlist {
    return {
      _id: doc._id,
      userId: doc.userId,
      items: (doc.items || []).map((item: any) => ({
        variantId: item.variantId,
        addedAt: item.addedAt,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Fetches the Wishlist aggregate for a user ID.
   */
  async findByUserId(userId: string): Promise<IWishlist | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const doc = await WishlistModel.findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();

    return doc ? this.mapToDomain(doc) : null;
  }

  /**
   * Creates a new empty Wishlist aggregate for a user.
   */
  async create(userId: string): Promise<IWishlist> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId format: ${userId}`);
    }

    const userObjId = new Types.ObjectId(userId);

    // Upsert to ensure 1:1 user wishlist invariant safely
    const doc = await WishlistModel.findOneAndUpdate(
      { userId: userObjId },
      { $setOnInsert: { userId: userObjId, items: [] } },
      { new: true, upsert: true }
    )
      .lean()
      .exec();

    return this.mapToDomain(doc);
  }

  /**
   * Atomically adds a product variant to the user's wishlist if not already present.
   * Guarantees variant uniqueness without array duplicates.
   */
  async addItem(userId: string, variantId: string): Promise<IWishlist | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(variantId)) {
      return null;
    }

    const userObjId = new Types.ObjectId(userId);
    const variantObjId = new Types.ObjectId(variantId);

    // Ensure wishlist aggregate exists first
    await this.create(userId);

    // Push item only if variantId is NOT already present in items array
    const updatedDoc = await WishlistModel.findOneAndUpdate(
      {
        userId: userObjId,
        'items.variantId': { $ne: variantObjId },
      },
      {
        $push: {
          items: {
            variantId: variantObjId,
            addedAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .lean()
      .exec();

    // If updatedDoc is null, the item already exists in the array; return current wishlist
    if (!updatedDoc) {
      return this.findByUserId(userId);
    }

    return this.mapToDomain(updatedDoc);
  }

  /**
   * Atomically removes a product variant from the user's wishlist using $pull.
   */
  async removeItem(userId: string, variantId: string): Promise<IWishlist | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(variantId)) {
      return null;
    }

    const userObjId = new Types.ObjectId(userId);
    const variantObjId = new Types.ObjectId(variantId);

    const updatedDoc = await WishlistModel.findOneAndUpdate(
      { userId: userObjId },
      {
        $pull: {
          items: { variantId: variantObjId },
        },
      },
      { new: true }
    )
      .lean()
      .exec();

    return updatedDoc ? this.mapToDomain(updatedDoc) : null;
  }

  /**
   * Checks if a specific variant exists in the user's wishlist using index query.
   */
  async exists(userId: string, variantId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(variantId)) {
      return false;
    }

    const count = await WishlistModel.countDocuments({
      userId: new Types.ObjectId(userId),
      'items.variantId': new Types.ObjectId(variantId),
    }).exec();

    return count > 0;
  }

  /**
   * Clears all items from the user's wishlist aggregate.
   */
  async clear(userId: string): Promise<IWishlist | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const updatedDoc = await WishlistModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { items: [] } },
      { new: true }
    )
      .lean()
      .exec();

    return updatedDoc ? this.mapToDomain(updatedDoc) : null;
  }
}
