import { useEffect, useRef, useState } from "react";
import About from "../components/About";
import Card from "../components/Card";
import CategoryCard from "../components/CategoryCard";
import Hero from "../components/Hero";
import styles from "../css/HomePage.module.scss";
import type { LocalPost } from "../types/post";
import { getAllPosts } from "../utils/postData";

function HomePage() {
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [allPosts, setAllPosts] = useState<LocalPost[]>([]);
  const nextSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const all = getAllPosts();
    const latest = all.slice(0, 3);
    setPosts(latest);
    setAllPosts(all);
  }, []);

  const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags))).slice(0, 8);
  const categories = Array.from(new Set(allPosts.map((post) => post.category)));
  const latestDate = allPosts[0]?.date;
  const topCategories = Array.from(
    allPosts.reduce((map, post) => {
      map.set(post.category, (map.get(post.category) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <Hero nextSectionRef={nextSectionRef} />

      <section ref={nextSectionRef} className={styles.sectionBlock}>
        <h2 className={styles.latestPosts}>最新文章</h2>
        <div className={styles.cardlist}>
          {posts.length > 0 &&
            posts.map((post) => (
              <Card
                key={post.slug}
                title={post.title}
                link={`/articles/${post.slug}`}
                description={post.description}
                date={new Date(post.date).toLocaleDateString()}
              />
            ))}
          {posts.length === 0 && (
            <div className={styles.emptyBlock}>
              <p>还没有文章，去文章页上传 Markdown 即可开始。</p>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.sectionBlock} ${styles.overview}`}>
        <div className={styles.stat}>
          <span>文章总数</span>
          <strong>{allPosts.length}</strong>
        </div>
        <div className={styles.stat}>
          <span>标签数量</span>
          <strong>{new Set(allPosts.flatMap((post) => post.tags)).size}</strong>
        </div>
        <div className={styles.stat}>
          <span>分类数量</span>
          <strong>{categories.length}</strong>
        </div>
        <div className={styles.stat}>
          <span>最近更新</span>
          <strong className={styles.smallNumber}>{latestDate ? new Date(latestDate).toLocaleDateString() : "--"}</strong>
        </div>
        <div className={styles.tagCloud}>
          {tags.length === 0 && <span>暂无标签</span>}
          {tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
        <div className={styles.categoryCloud}>
          {topCategories.length === 0 && <span>暂无分类</span>}
          {topCategories.map(([name, count]) => (
            <span key={name}>
              {name} ({count})
            </span>
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <CategoryCard />
      </section>
      <section className={styles.sectionBlock}>
        <About />
      </section>
    </>
  );
}

export default HomePage;
