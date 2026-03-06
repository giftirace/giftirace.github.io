import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "../css/Header.module.scss";

const navItems = [
  { to: "/", label: "家" },
  { to: "/articles", label: "文章" },
  { to: "/funny", label: "有趣的东西" },
  { to: "/garden", label: "花园" },
  { to: "/about", label: "关于" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            Blog
          </Link>

          <nav className={styles.desktopNav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button className={styles.mobileToggle} onClick={() => setOpen(true)} aria-label="打开菜单">
            菜单
          </button>
        </div>
      </header>

      <div className={`${styles.backdrop} ${open ? styles.show : ""}`} onClick={() => setOpen(false)} />
      <aside className={`${styles.drawer} ${open ? styles.show : ""}`}>
        <div className={styles.drawerHead}>
          <span>导航</span>
          <button onClick={() => setOpen(false)} aria-label="关闭菜单">
            关闭
          </button>
        </div>
        <nav className={styles.mobileNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
