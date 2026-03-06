import type { LocalPost } from "../types/post";
import { getStoredPosts } from "./localPosts";
import { getStaticPosts } from "./staticPosts";

export const sortPostsByDateDesc = (posts: LocalPost[]): LocalPost[] =>
  [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const getAllPosts = (): LocalPost[] => {
  const merged = [...getStaticPosts(), ...getStoredPosts()];
  const bySlug = new Map<string, LocalPost>();
  merged.forEach((post) => bySlug.set(post.slug, post));
  return sortPostsByDateDesc(Array.from(bySlug.values()));
};

