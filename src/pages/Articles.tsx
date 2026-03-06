import { type ChangeEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../css/Articles.module.scss";
import type { LocalPost } from "../types/post";
import { createPostFromMarkdown, getStoredPosts, saveStoredPosts } from "../utils/localPosts";
import { sortPostsByDateDesc } from "../utils/postData";
import { getStaticPosts } from "../utils/staticPosts";

export default function Articles() {
  const staticPosts = useMemo(() => sortPostsByDateDesc(getStaticPosts()), []);
  const [localPosts, setLocalPosts] = useState<LocalPost[]>(() => sortPostsByDateDesc(getStoredPosts()));
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState("all");
  const [keyword, setKeyword] = useState("");
  const posts = useMemo(() => sortPostsByDateDesc([...staticPosts, ...localPosts]), [staticPosts, localPosts]);

  const hasPosts = useMemo(() => posts.length > 0, [posts.length]);
  const allCategories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category))).sort((a, b) => a.localeCompare(b)),
    [posts]
  );
  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b)),
    [posts]
  );
  const filteredPosts = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    return posts.filter((post) => {
      const categoryMatched = activeCategory === "all" || post.category === activeCategory;
      const tagMatched = activeTag === "all" || post.tags.includes(activeTag);
      const keywordMatched =
        !key ||
        post.title.toLowerCase().includes(key) ||
        post.description.toLowerCase().includes(key) ||
        post.category.toLowerCase().includes(key) ||
        post.tags.some((tag) => tag.toLowerCase().includes(key));
      return categoryMatched && tagMatched && keywordMatched;
    });
  }, [activeCategory, activeTag, keyword, posts]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setMessage("");

    try {
      const selectedFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith(".md"));
      if (selectedFiles.length === 0) {
        setMessage("Please select .md files");
        return;
      }

      const fileContents = await Promise.all(
        selectedFiles.map(async (file) => ({
          fileName: file.name,
          content: await file.text(),
        }))
      );

      const newPosts = fileContents.map((item) => createPostFromMarkdown(item.fileName, item.content));
      const nextLocalPosts = sortPostsByDateDesc([...newPosts, ...localPosts]);
      setLocalPosts(nextLocalPosts);
      saveStoredPosts(nextLocalPosts);
      setMessage(`Imported ${newPosts.length} article(s)`);
    } catch {
      setMessage("Upload failed, please retry");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = (slug: string) => {
    const nextPosts = localPosts.filter((post) => post.slug !== slug);
    setLocalPosts(nextPosts);
    saveStoredPosts(nextPosts);
  };

  return (
    <div className={styles.articlesPage}>
      <aside className={styles.sideLeft}>
        <div className={styles.sideCard}>
          <h3>数据概览</h3>
          <p>文章总数：{posts.length}</p>
          <p>分类数量：{allCategories.length}</p>
          <p>标签数量：{allTags.length}</p>
        </div>
        <div className={styles.sideCard}>
          <h3>使用提示</h3>
          <p>建议在 front matter 中填写 `title/date/category/tags`。</p>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h1 className={styles.listTitle}>文章列表</h1>

        <section className={styles.uploader}>
          <label htmlFor="md-upload" className={styles.uploadButton}>
            {isUploading ? "导入中..." : "上传 Markdown"}
          </label>
          <input
            id="md-upload"
            type="file"
            accept=".md,text/markdown"
            multiple
            onChange={handleUpload}
            disabled={isUploading}
          />
          <p className={styles.hint}>文件保存在当前浏览器（localStorage）</p>
          <p className={styles.hint}>支持字段：title、date、category、tags</p>
          <p className={styles.hint}>`/posts` 目录下的 markdown 会自动加载</p>
          {message && <p className={styles.message}>{message}</p>}
          <input
            className={styles.searchInput}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search"
          />
        </section>

        {allCategories.length > 0 && (
          <section className={styles.categoryFilters}>
            <button
              type="button"
              className={activeCategory === "all" ? styles.filterActive : ""}
              onClick={() => setActiveCategory("all")}
            >
              全部分类
            </button>
            {allCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? styles.filterActive : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </section>
        )}

        {allTags.length > 0 && (
          <section className={styles.tagFilters}>
            <button
              type="button"
              className={activeTag === "all" ? styles.filterActive : ""}
            onClick={() => setActiveTag("all")}
          >
              全部标签
          </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={activeTag === tag ? styles.filterActive : ""}
                onClick={() => setActiveTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </section>
        )}

        <section className={styles.list}>
          {!hasPosts && <p className={styles.empty}>还没有文章，上传一个 .md 文件开始吧。</p>}
          {hasPosts && filteredPosts.length === 0 && <p className={styles.empty}>当前筛选条件下没有文章。</p>}
          {filteredPosts.map((post) => (
            <article key={post.slug} className={styles.postItem}>
              <div className={styles.postMain}>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <div className={styles.meta}>
                  <span>{new Date(post.date).toLocaleString()}</span>
                  <button
                    type="button"
                    className={styles.categoryBadge}
                    onClick={() => setActiveCategory(post.category)}
                  >
                    {post.category}
                  </button>
                </div>
                {post.tags.length > 0 && (
                  <div className={styles.tags}>
                    {post.tags.map((tag) => (
                      <button key={tag} type="button" onClick={() => setActiveTag(tag)}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.actions}>
                <Link to={`/articles/${post.slug}`}>View</Link>
                {post.source === "local" ? (
                  <button type="button" onClick={() => handleDelete(post.slug)}>
                    删除
                  </button>
                ) : (
                  <span className={styles.readOnly}>来自 /posts</span>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>

      <aside className={styles.sideRight}>
        <div className={styles.sideCard}>
          <h3>当前筛选</h3>
          <p>分类：{activeCategory === "all" ? "全部" : activeCategory}</p>
          <p>标签：{activeTag === "all" ? "全部" : `#${activeTag}`}</p>
          <p>结果：{filteredPosts.length} 篇</p>
        </div>
        <div className={styles.sideCard}>
          <h3>常用标签</h3>
          {allTags.slice(0, 8).map((tag) => (
            <button key={tag} type="button" onClick={() => setActiveTag(tag)}>
              #{tag}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
