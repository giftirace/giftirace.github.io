import { useEffect, useMemo, useState } from "react";
import styles from "../css/HomePage.module.scss";
import { getAllPosts } from "../utils/postData";

function HomePage() {
  const [allPosts, setAllPosts] = useState(() => getAllPosts());

  useEffect(() => {
    setAllPosts(getAllPosts());
  }, []);

  const latestPosts = useMemo(() => allPosts.slice(0, 8), [allPosts]);

  const categories = useMemo(
    () =>
      Array.from(
        allPosts.reduce((map, post) => {
          map.set(post.category, (map.get(post.category) ?? 0) + 1);
          return map;
        }, new Map<string, number>())
      ).sort((a: [string, number], b: [string, number]) => b[1] - a[1]),
    [allPosts]
  );

  const tags = useMemo(
    () => Array.from(new Set(allPosts.flatMap((post) => post.tags))).slice(0, 24),
    [allPosts]
  );

  const latestDate = allPosts[0]?.date;

  return (
    <div className={styles.homeFrame}>
      <section className={styles.heroPanel}>
        <div className={styles.heroHeader}>
          <span>My Blog</span>
          <span>About, Email, IG</span>
        </div>

        <div className={styles.heroMain}>
          <h1>狡猾的老巢</h1>
          <p>观察世界中</p>
        </div>

        <div className={styles.heroFooter}>
          <p>From notes to stories,</p>
          <p>keep writing and keep curious.</p>
        </div>
      </section>

      <section className={styles.contentPanel}>
        <div className={styles.contentInner}>
          <article id="about" className={styles.block}>
            <div className={styles.blockTitle}>关于我</div>
            <div className={styles.blockBody}>
              <p>
                你好，我在这里记录技术、设计、生活和偶尔的灵光一闪。
                这是我的数字花园，会持续生长。
              </p>
              <p className={styles.metaLine}>共 {allPosts.length} 篇文章 · 最近更新 {latestDate ? new Date(latestDate).toLocaleDateString() : "--"}</p>
            </div>
          </article>

          <article id="articles" className={styles.block}>
            <div className={styles.blockTitle}>文章列表</div>
            <div className={styles.blockBody}>
              {latestPosts.length === 0 ? (
                <p>还没有文章，去文章页上传 Markdown 开始写作吧。</p>
              ) : (
                <ul className={styles.postList}>
                  {latestPosts.map((post) => (
                    <li key={post.slug}>
                      <a href={`#/articles/${post.slug}`}>{post.title}</a>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <article id="categories" className={styles.block}>
            <div className={styles.blockTitle}>分类</div>
            <div className={styles.blockBody}>
              {categories.length === 0 ? (
                <p>暂无分类</p>
              ) : (
                <ul className={styles.categoryList}>
                  {categories.map(([name, count]) => (
                    <li key={name}>
                      <span>{name}</span>
                      <strong>{count}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <article className={styles.block}>
            <div className={styles.blockTitle}>标签</div>
            <div className={styles.blockBody}>
              {tags.length === 0 ? (
                <p>暂无标签</p>
              ) : (
                <div className={styles.tagList}>
                  {tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
