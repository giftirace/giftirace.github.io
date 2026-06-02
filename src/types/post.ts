export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
}

export interface LocalPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
  fileName: string;
  source: "local" | "static";
}
