import styles from '../css/CategoryCard.module.scss'
import { useMemo, useState } from 'react'

export default function CategoryCard() {
  const categoryCards = ['前端', '设计', '生活', '碎碎念']
  const cardWidth = 250
  const halfCard = 125
  const maxRealIndex = categoryCards.length - 1

  const exCards = useMemo(() => {
    return [categoryCards[maxRealIndex], ...categoryCards, categoryCards[0]]
  }, [])

  const [index, setIndex] = useState(1)
  const [enableTransition, setEnableTransition] = useState(true)

  const handlePrev = () => {
    setEnableTransition(true)
    setIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    setEnableTransition(true)
    setIndex((prev) => prev + 1)
  }

  const translateX = halfCard - index * cardWidth

  const onTransitionEnd = () => {
    if (index === 0) {
      setEnableTransition(false)
      setIndex(maxRealIndex + 1)
    }
    if (index === maxRealIndex + 2) {
      setEnableTransition(false)
      setIndex(1)
    }
  }

  return (
    <section className={styles.categorySection}>
      <h2 className={styles.title}>文章分类</h2>
      <div className={styles.carouselSection}>
        <button className={styles.prev} onClick={handlePrev} aria-label="上一项">
          &lt;
        </button>
        <div className={styles.carouselWrapper}>
          <div
            className={styles.carouselTrack}
            style={{
              transform: `translateX(${translateX}px)`,
              transition: enableTransition ? 'transform 0.3s ease' : 'none',
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {exCards.map((c, i) => (
              <div key={`${c}-${i}`} className={styles.categoryCard}>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <button className={styles.next} onClick={handleNext} aria-label="下一项">
          &gt;
        </button>
      </div>
    </section>
  )
}
