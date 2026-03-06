import { type RefObject, useEffect, useState } from 'react';
import styles from '../css/Hero.module.scss'
import { IoIosArrowDown } from "react-icons/io";
import BunnyIdle from '../assets/bunny/BunnyIdle.gif';
import BunnyJump from '../assets/bunny/BunnyJump.gif';
import BunnyLieDown from '../assets/bunny/BunnyLieDown.gif';
import BunnyRun from '../assets/bunny/BunnyRun.gif';
import BunnySitting from '../assets/bunny/BunnySitting.gif';
import BunnySleep from '../assets/bunny/BunnySleep.gif';

interface HeroProps {
    nextSectionRef: RefObject<HTMLElement | null>
}

export default function Hero({nextSectionRef}: HeroProps) {
    const gifs = [BunnyIdle, BunnyJump, BunnyRun, BunnyLieDown, BunnySitting, BunnySleep]

    const [currentGif, setCurrentGif] = useState(0)

    useEffect(() => {
        const timer = setInterval(
            () => {
                setCurrentGif(prev => (prev + 1) % gifs.length);
            }
            , 10000)
        return ()=> clearInterval(timer);
    }, [])

    const handleMouseEnter = () => setCurrentGif(1)
    const handleMouseLeave = () => setCurrentGif(0)
    const handleClick = () => setCurrentGif(2)

    const handleNextSection = () =>{
        nextSectionRef.current?.scrollIntoView({
            behavior:'smooth'
        })
    }


    return (
        <section className={styles.hero}>

            <img 
            src={gifs[currentGif]} 
            alt="bunny"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
             className={styles.bunny} />
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>狡猾的老巢</h1>
                <p className={styles.heroDescription}>观察世界中</p>
                <button className={styles.cta}
                onClick={handleNextSection}
                ><IoIosArrowDown /></button>
                
            </div>
        </section>
    )
}
