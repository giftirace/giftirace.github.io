import type { LocalPost } from "../types/post";
import { createPostFromMarkdown } from "./localPosts";

const staticMarkdownModules = import.meta.glob("/posts/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const toSlug = (path: string): string => {
  const normalized = path.replace(/^\/posts\//, "").replace(/\.md$/i, "");
  return `static-${encodeURIComponent(normalized).replace(/%/g, "")}`;
};

const isIgnoredFile = (path: string): boolean => {
  const fileName = path.split("/").pop()?.toLowerCase() ?? "";
  return fileName === "readme.md" || fileName === "template.md";
};

export const getStaticPosts = (): LocalPost[] =>
  Object.entries(staticMarkdownModules)
    .filter(([path]) => !isIgnoredFile(path))
    .map(([path, content]) => {
      const fileName = path.split("/").pop() ?? "post.md";
      return createPostFromMarkdown(fileName, content, {
        slug: toSlug(path),
        source: "static",
      });
    });

