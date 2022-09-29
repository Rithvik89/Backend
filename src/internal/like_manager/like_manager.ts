import { PrismaClient } from "@prisma/client";
import { IKVStore } from "../../pkg/kv_store/kv_store";

export default class LikeManager {
  private store: PrismaClient;
  private cache: IKVStore;
  constructor(store: PrismaClient, cache: IKVStore) {
    this.store = store;
    this.cache = cache;
  }

  async GetLikesCount(post_id: bigint) {
    return this.store.likes.count({ where: { post_id } });
  }

  async GetLikesForPost(post_id: bigint, limit: number, offset: number) {
    try {
      const _likes = await this.store.likes.findMany({
        where: { post_id },
        take: limit,
        skip: offset,
        include: {
          user: { select: { Profile: { select: { username: true } } } },
        },
      });

      // transforming data
      const likes: { create_at: Date; username: string; type: number }[] = [];
      _likes.forEach((item, index) => {
        if (item.user.Profile?.username)
          likes.push({
            create_at: item.created_at,
            username: item.user.Profile.username,
            type: item.type,
          });
      });

      return likes;
    } catch (err) {
      throw err;
    }
  }

  // updates the like type or creates one
  async Like(post_id: bigint, user_id: number, type: number) {
    return await this.store.likes.upsert({
      where: { user_id_post_id: { post_id, user_id } },
      update: { type },
      create: { type, user_id, post_id },
    });
  }

  async Unlike(post_id: bigint, user_id: number) {
    return this.store.likes.delete({
      where: { user_id_post_id: { post_id, user_id } },
    });
  }
}
