/**
 * BlackBird Capital - JavaScript Optimizado
 * Progressive Enhancement con funcionalidad unificada
 */

(function() {
  'use strict';

  // Estado global de la aplicación
  const state = {
    menuOpen: false,
    currentFundIndex: 0,
    currentTeamIndex: 0,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /**
   * Header sticky y navegación
   */
  const initHeader = () => {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.nav__toggle');
    const menu = document.querySelector('.nav__menu');
    const links = document.querySelectorAll('.nav__link');
    
    if (!header) return;

    // Scroll handling
    let lastScroll = 0;
    let ticking = false;
    
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      
      // Add scrolled class
      if (currentScroll > 100) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      
      // Hide/show on scroll direction
      if (currentScroll > lastScroll && currentScroll > 300) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
      
      lastScroll = currentScroll;
      ticking = false;
    };
    
    const requestScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestScroll, { passive: true });
    
    // Mobile menu toggle
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        state.menuOpen = !state.menuOpen;
        toggle.setAttribute('aria-expanded', state.menuOpen);
        menu.classList.toggle('is-active', state.menuOpen);
      });
      
      // Close on link click
      links.forEach(link => {
        link.addEventListener('click', () => {
          if (state.menuOpen) {
            state.menuOpen = false;
            toggle.setAttribute('aria-expanded', false);
            menu.classList.remove('is-active');
          }
        });
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (state.menuOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
          state.menuOpen = false;
          toggle.setAttribute('aria-expanded', false);
          menu.classList.remove('is-active');
        }
      });
      
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (state.menuOpen && e.key === 'Escape') {
          state.menuOpen = false;
          toggle.setAttribute('aria-expanded', false);
          menu.classList.remove('is-active');
          toggle.focus();
        }
      });
    }
    
    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60% 0px',
      threshold: 0.2
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          links.forEach(link => {
            link.classList.remove('nav__link--active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('nav__link--active');
            }
          });
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
  };

  /**
   * Smooth scroll for anchor links
   */
  const initSmoothScroll = () => {
    if (state.prefersReducedMotion) return;
    
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        e.preventDefault();
        
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        history.pushState(null, '', targetId);
      });
    });
  };

  /**
   * Carrusel de Fondos
   */
  const initFundsCarousel = () => {
    const track = document.getElementById('funds-track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!track) return;
    
    const cards = track.querySelectorAll('.fund-card');
    const dotsContainer = document.querySelector('.funds__controls .carousel-dots');
    
    // Create dots
    cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ir al fondo ${index + 1}`);
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer?.appendChild(dot);
    });
    
    const dots = dotsContainer?.querySelectorAll('button');
    
    const getMetrics = () => {
      const cardWidth = cards[0]?.getBoundingClientRect().width || 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 32;
      const containerWidth = track.parentElement?.clientWidth || 0;
      const visible = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
      const maxIndex = Math.max(0, cards.length - visible);
      return { cardWidth, gap, visible, maxIndex };
    };
    
    const updateCarousel = () => {
      const { cardWidth, gap, maxIndex } = getMetrics();
      state.currentFundIndex = Math.max(0, Math.min(state.currentFundIndex, maxIndex));
      
      const translateX = -state.currentFundIndex * (cardWidth + gap);
      track.style.transform = `translateX(${translateX}px)`;
      
      // Update dots
      dots?.forEach((dot, i) => {
        dot.classList.toggle('active', i === state.currentFundIndex);
      });
      
      // Update buttons
      if (prevBtn) prevBtn.disabled = state.currentFundIndex === 0;
      if (nextBtn) nextBtn.disabled = state.currentFundIndex >= maxIndex;
    };
    
    const goToSlide = (index) => {
      state.currentFundIndex = index;
      updateCarousel();
    };
    
    // Event listeners
    prevBtn?.addEventListener('click', () => {
      if (state.currentFundIndex > 0) {
        state.currentFundIndex--;
        updateCarousel();
      }
    });
    
    nextBtn?.addEventListener('click', () => {
      const { maxIndex } = getMetrics();
      if (state.currentFundIndex < maxIndex) {
        state.currentFundIndex++;
        updateCarousel();
      }
    });
    
    // Touch support
    let startX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        const { maxIndex } = getMetrics();
        if (diff > 0 && state.currentFundIndex < maxIndex) {
          state.currentFundIndex++;
        } else if (diff < 0 && state.currentFundIndex > 0) {
          state.currentFundIndex--;
        }
        updateCarousel();
      }
      
      isDragging = false;
    }, { passive: true });
    
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCarousel, 150);
    });
    
    // Initialize
    updateCarousel();
  };

  /**
   * Carrusel de Equipo
   */
  const initTeamCarousel = () => {
    const track = document.getElementById('teamTrack');
    const prevBtn = document.getElementById('teamPrevBtn');
    const nextBtn = document.getElementById('teamNextBtn');
    
    if (!track) return;
    
    const members = track.querySelectorAll('.team-member');
    const dotsContainer = document.querySelector('.team__controls .carousel-dots');
    
    // Create dots
    members.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ver miembro ${index + 1}`);
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToMember(index));
      dotsContainer?.appendChild(dot);
    });
    
    const dots = dotsContainer?.querySelectorAll('button');
    
    const centerMember = () => {
      const memberWidth = members[0]?.getBoundingClientRect().width || 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 32;
      const containerWidth = track.parentElement?.clientWidth || 0;
      const centerOffset = (containerWidth - memberWidth) / 2;
      const translateX = -state.currentTeamIndex * (memberWidth + gap) + centerOffset;
      
      track.style.transform = `translateX(${translateX}px)`;
    };
    
    const updateTeam = () => {
      members.forEach((member, i) => {
        member.classList.toggle('active', i === state.currentTeamIndex);
      });
      
      dots?.forEach((dot, i) => {
        dot.classList.toggle('active', i === state.currentTeamIndex);
      });
      
      if (prevBtn) prevBtn.disabled = state.currentTeamIndex === 0;
      if (nextBtn) nextBtn.disabled = state.currentTeamIndex === members.length - 1;
      
      centerMember();
    };
    
    const goToMember = (index) => {
      state.currentTeamIndex = index;
      updateTeam();
    };
    
    // Event listeners
    prevBtn?.addEventListener('click', () => {
      if (state.currentTeamIndex > 0) {
        state.currentTeamIndex--;
        updateTeam();
      }
    });
    
    nextBtn?.addEventListener('click', () => {
      if (state.currentTeamIndex < members.length - 1) {
        state.currentTeamIndex++;
        updateTeam();
      }
    });
    
    // Click on member to select
    members.forEach((member, index) => {
      member.addEventListener('click', () => {
        if (state.currentTeamIndex !== index) {
          goToMember(index);
        }
      });
    });
    
    // Touch support
    let startX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && state.currentTeamIndex < members.length - 1) {
          state.currentTeamIndex++;
        } else if (diff < 0 && state.currentTeamIndex > 0) {
          state.currentTeamIndex--;
        }
        updateTeam();
      }
      
      isDragging = false;
    }, { passive: true });
    
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(centerMember, 150);
    });
    
    // Initialize
    updateTeam();
  };

  /**
   * Animated counter for stats
   */
  const initStats = () => {
    if (state.prefersReducedMotion) return;
    
    const statItems = document.querySelectorAll('.stat-item h3[data-target]');
    if (!statItems.length) return;
    
    const animateValue = (element, target, options = {}) => {
      const {
        duration = 1500,
        decimal = false,
        suffix = ''
      } = options;
      
      const startTime = performance.now();
      const startValue = 0;
      
      const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = startValue + (target - startValue) * eased;
        
        let display;
        if (decimal) {
          display = current.toFixed(1);
        } else {
          display = Math.floor(current).toString();
        }
        
        element.textContent = display + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      
      requestAnimationFrame(step);
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseFloat(element.getAttribute('data-target'));
          const decimal = element.getAttribute('data-decimal') === 'true';
          const suffix = element.getAttribute('data-suffix') || '';
          
          animateValue(element, target, { decimal, suffix });
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.5
    });
    
    statItems.forEach(item => observer.observe(item));
  };

  /**
   * Accordion for FAQ
   */
  const initAccordion = () => {
    const triggers = document.querySelectorAll('.accordion__trigger');
    
    triggers.forEach(trigger => {
      const content = trigger.nextElementSibling;
      
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        
        // Close all others
        triggers.forEach(otherTrigger => {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherTrigger.nextElementSibling.hidden = true;
          }
        });
        
        // Toggle current
        trigger.setAttribute('aria-expanded', !isExpanded);
        content.hidden = isExpanded;
      });
    });
  };

  /**
   * Newsletter form
   */
  const initNewsletter = () => {
    const form = document.querySelector('.newsletter__form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const button = form.querySelector('button');
      const originalText = button.textContent;
      
      button.textContent = '✓ Suscrito';
      button.disabled = true;
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        form.reset();
      }, 3000);
    });
  };

  /**
   * Initialize all components
   */
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    console.log('BlackBird Capital - Initializing');
    
    initHeader();
    initSmoothScroll();
    initFundsCarousel();
    initTeamCarousel();
    initStats();
    initAccordion();
    initNewsletter();
    
    document.body.classList.add('js-initialized');
  };
  
  // Start the application
  init();
  
  // Public API
  window.BlackBirdCapital = {
    state,
    reinit: init
  };
})();