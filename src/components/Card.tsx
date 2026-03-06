import styles from '../css/Card.module.scss'
import { Link } from 'react-router-dom'

interface CardProps {
  title: string
  img?: string
  link: string
  description?: string
  date: string
}

export default function Card({ title, img, link, description, date }: CardProps) {
  return (
    <article className={styles.card}>
      {img && <img src={img} alt={title} loading="lazy" className={styles.img} />}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
        <span className={styles.date}>{date}</span>
        <Link to={link} className={styles.more}>
          阅读更多 &gt;
        </Link>
      </div>
    </article>
  )
}
