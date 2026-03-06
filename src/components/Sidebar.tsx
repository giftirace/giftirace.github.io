import { useState } from 'react'
import styles from '../css/Sidebar.module.scss'
import { FaHouse } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}>
            <button className={styles.toggleBtn} onClick={() => setIsOpen(prev => !prev)}>
                {isOpen ? '<' : <FaHouse />}
            </button>
            <ul className={styles.menu}>
                <li>
                    <Link to='/'>家</Link>
                </li>
                <li>
                    <Link to='/articles'>文章</Link>
                </li>
                <li>
                    <Link to='/funny'>有趣的东西</Link>
                </li>
                <li>
                    <Link to='/garden'>花园</Link>
                </li>
                <li>
                    <Link to='/about'>关于</Link>
                </li>

            </ul>
        </div>
    )
}

export default Sidebar;