export type PostSource = "local" | "static";

export interface LocalPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
  fileName: string;
  source: PostSource;
}
