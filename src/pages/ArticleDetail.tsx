import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../css/ArticleDetail.module.scss";
import { getAllPosts } from "../utils/postData";
import { extractMarkdownToc, renderMarkdown } from "../utils/markdown";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const allPosts = useMemo(() => getAllPosts(), []);
  const post = useMemo(() => allPosts.find((item) => item.slug === slug) ?? null, [allPosts, slug]);

  const html = useMemo(() => renderMarkdown(post?.content ?? ""), [post?.content]);
  const toc = useMemo(() => extractMarkdownToc(post?.content ?? "").slice(0, 10), [post?.content]);

  const currentIndex = useMemo(() => allPosts.findIndex((item) => item.slug === post?.slug), [allPosts, post?.slug]);
  const prevPost = currentIndex >= 0 ? allPosts[currentIndex + 1] ?? null : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] ?? null : null;

  if (!post) {
    return (
      <div className={styles.articleDetailPage}>
        <div className={styles.articleWrapper}>
          <h2>文章不存在</h2>
          <p>没有找到这篇文章，可能已删除或链接无效。</p>
          <Link to="/articles">返回文章列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.articleDetailPage}>
      <aside className={styles.sideLeft}>
        <div className={styles.sideCard}>
          <h3>文章信息</h3>
          <p>{new Date(post.date).toLocaleString()}</p>
          <p>分类：{post.category}</p>
        </div>
        <div className={styles.sideCard}>
          <Link to="/articles">返回列表</Link>
        </div>
      </aside>

      <div className={styles.articleWrapper}>
        <h1>{post.title}</h1>
        <p className={styles.meta}>发布时间：{new Date(post.date).toLocaleString()}</p>

        <div className={styles.categoryRow}>
          <span>{post.category}</span>
        </div>

        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className={styles.pager}>
          {prevPost ? (
            <Link to={`/articles/${prevPost.slug}`} className={styles.pagerLink}>
              ← {prevPost.title}
            </Link>
          ) : (
            <span className={styles.pagerEmpty} />
          )}
          {nextPost ? (
            <Link to={`/articles/${nextPost.slug}`} className={styles.pagerLink}>
              {nextPost.title} →
            </Link>
          ) : (
            <span className={styles.pagerEmpty} />
          )}
        </div>

        <article className={styles.markdown} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <aside className={styles.sideRight}>
        <div className={styles.sideCard}>
          <h3>快速目录</h3>
          {toc.length === 0 && <p>暂无标题</p>}
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={styles.tocItem}>
              {item.text}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}
