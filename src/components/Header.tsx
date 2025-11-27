import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export const Header = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = ['home', 'movie-details', 'favorites', 'about'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.top}>
          <a 
            href="#home" 
            className={styles.logo}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
          >
            🎬 MovieCatalog
          </a>
          <nav>
            <ul className={styles.nav}>
              <li>
                <a
                  href="#home"
                  className={`${styles.navLink} ${activeSection === 'home' ? styles.active : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('home');
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#favorites"
                  className={`${styles.navLink} ${activeSection === 'favorites' ? styles.active : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('favorites');
                  }}
                >
                  Favorites
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className={`${styles.navLink} ${activeSection === 'about' ? styles.active : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('about');
                  }}
                >
                  About
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
