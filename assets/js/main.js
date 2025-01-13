/* ===================================================================
 * Main JS
 * ------------------------------------------------------------------- */

(function(html) {

    'use strict';

    /* Preloader
    * -------------------------------------------------- */
    const preloader = document.querySelector("#preloader");
    if (preloader) {
        window.addEventListener('load', function() {
            document.querySelector('body').classList.remove('ss-preload');
            document.querySelector('body').classList.add('ss-loaded');
            preloader.style.display = 'none';
        });
    }

    /* Mobile Menu
    * -------------------------------------------------- */
    const menuToggle = document.querySelector('.s-header__menu-toggle');
    const nav = document.querySelector('.s-header__nav');
    const closeBtn = document.querySelector('.s-header__nav-close-btn');
    const menuLinks = document.querySelectorAll('.s-header__nav-list a');

    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            nav.classList.add('is-active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            nav.classList.remove('is-active');
        });
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('is-active');
        });
    });

    /* Smooth Scrolling
    * -------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    /* Back to Top
    * -------------------------------------------------- */
    const goTop = document.querySelector('.ss-go-top');

    if (goTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 800) {
                goTop.classList.add('link-is-visible');
            } else {
                goTop.classList.remove('link-is-visible');
            }
        });
    }

})(document.documentElement);