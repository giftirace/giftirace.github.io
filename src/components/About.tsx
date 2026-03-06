import styles from '../css/About.module.scss'

export default function About() {
  return (
    <div className={styles.aboutWrapper}>
      <div className={styles.about}>
        <img className={styles.img} src="" alt="" />
        <div className={styles.description}>
          <h2 className={styles.title}>关于我</h2>
          <p className={styles.quote}>（我要当皇族妈）</p>
        </div>
      </div>
    </div>
  )
}
