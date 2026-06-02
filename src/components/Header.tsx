import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "../css/Header.module.scss";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/articles", label: "Articles" },
  { to: "/write", label: "Write" },
  { to: "/funny", label: "Funny" },
  { to: "/garden", label: "Garden" },
  { to: "/about", label: "About" },
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

          <button className={styles.mobileToggle} onClick={() => setOpen(true)} aria-label="Open menu">
            Menu
          </button>
        </div>
      </header>

      <div className={`${styles.backdrop} ${open ? styles.show : ""}`} onClick={() => setOpen(false)} />
      <aside className={`${styles.drawer} ${open ? styles.show : ""}`}>
        <div className={styles.drawerHead}>
          <span>Navigation</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu">
            Close
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
