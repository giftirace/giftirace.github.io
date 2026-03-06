import type { LocalPost } from "../types/post";

const STORAGE_KEY = "blog-local-posts-v1";

const stripExtension = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "");
const isIsoDate = (value: string): boolean => !Number.isNaN(new Date(value).getTime());

const slugify = (text: string): string => {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "post";
};

const extractTitle = (content: string, fileName: string): string => {
  const match = content.match(/^#\s+(.+)$/m);
  if (match?.[1]) return match[1].trim();
  return stripExtension(fileName);
};

const extractDescription = (content: string): string => {
  const line = content
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.length > 0 && !item.startsWith("#"));

  if (!line) return "No summary";

  const plainText = line
    .replace(/[`*_>#-]/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .trim();

  return plainText.slice(0, 120) || "No summary";
};

type FrontMatter = {
  title?: string;
  date?: string;
  category?: string;
  tags?: string[];
};

const parseTags = (raw: string): string[] => {
  const value = raw.trim();

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseCategory = (raw: string): string => raw.trim().replace(/^["']|["']$/g, "");

const parseFrontMatter = (markdown: string): { body: string; frontMatter: FrontMatter } => {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  if (lines[0]?.trim() !== "---") {
    return { body: normalized, frontMatter: {} };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i]?.trim() === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { body: normalized, frontMatter: {} };
  }

  const frontMatterLines = lines.slice(1, endIndex);
  const body = lines.slice(endIndex + 1).join("\n");
  const frontMatter: FrontMatter = {};

  for (let i = 0; i < frontMatterLines.length; i += 1) {
    const line = frontMatterLines[i]?.trim() ?? "";
    if (!line || line.startsWith("#")) continue;

    const [rawKey, ...rawValueParts] = line.split(":");
    if (!rawKey || rawValueParts.length === 0) continue;

    const key = rawKey.trim().toLowerCase();
    const value = rawValueParts.join(":").trim();

    if (key === "title" && value) {
      frontMatter.title = value;
    }

    if (key === "date" && value) {
      frontMatter.date = value;
    }

    if ((key === "category" || key === "categories") && value) {
      frontMatter.category = parseCategory(value.split(",")[0] ?? "");
    }

    if (key === "tags") {
      if (value) {
        frontMatter.tags = parseTags(value);
        continue;
      }

      const list: string[] = [];
      let cursor = i + 1;
      while (cursor < frontMatterLines.length) {
        const itemLine = (frontMatterLines[cursor] ?? "").trim();
        if (!itemLine.startsWith("- ")) break;
        list.push(itemLine.slice(2).trim());
        cursor += 1;
      }
      if (list.length > 0) {
        frontMatter.tags = list;
        i = cursor - 1;
      }
    }
  }

  return { body, frontMatter };
};

export const getStoredPosts = (): LocalPost[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is Omit<LocalPost, "tags" | "category"> & { tags?: string[]; category?: string } =>
          Boolean(
            item &&
              typeof item === "object" &&
              "slug" in item &&
              "title" in item &&
              "description" in item &&
              "content" in item &&
              "date" in item &&
              "fileName" in item
          )
      )
      .map((item) => ({
        ...item,
        category: typeof item.category === "string" && item.category.trim() ? item.category.trim() : "Uncategorized",
        tags: Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === "string") : [],
        source: item.source === "static" ? "static" : "local",
      }));
  } catch {
    return [];
  }
};

export const saveStoredPosts = (posts: LocalPost[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

type CreatePostOptions = {
  slug?: string;
  source?: LocalPost["source"];
};

export const createPostFromMarkdown = (
  fileName: string,
  content: string,
  options?: CreatePostOptions
): LocalPost => {
  const { body, frontMatter } = parseFrontMatter(content);
  const now = new Date().toISOString();
  const title = frontMatter.title?.trim() || extractTitle(body, fileName);
  const slugBase = slugify(stripExtension(fileName));
  const suffix = Math.random().toString(36).slice(2, 7);
  const date = frontMatter.date && isIsoDate(frontMatter.date) ? new Date(frontMatter.date).toISOString() : now;
  const category = frontMatter.category?.trim() || "Uncategorized";
  const tags = frontMatter.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];

  return {
    slug: options?.slug ?? `${slugBase}-${Date.now()}-${suffix}`,
    title,
    description: extractDescription(body),
    content: body,
    date,
    category,
    tags,
    fileName,
    source: options?.source ?? "local",
  };
};
