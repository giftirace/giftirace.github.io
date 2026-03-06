import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section style={{ width: "min(1100px, calc(100% - 32px))", margin: "24px auto" }}>
      <h1>404</h1>
      <p>页面不存在。</p>
      <Link to="/">返回首页</Link>
    </section>
  );
}

