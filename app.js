/**
 * BlackBird Capital - JavaScript Optimizado con Popup de Mantenimiento
 * Progressive Enhancement con funcionalidad unificada
 */

(function() {
  'use strict';

  // Estado global de la aplicación
  const state = {
    menuOpen: false,
    currentFundIndex: 0,
    currentTeamIndex: 0,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    maintenanceShown: false
  };

  /**
   * Debounce para optimizar eventos
   */
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * Throttle para scroll
   */
  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  };

  /**
   * Popup de Mantenimiento
   */
  const initMaintenancePopup = () => {
    const overlay = document.getElementById('maintenanceOverlay');
    const closeBtn = document.getElementById('closeBtn');
    const timerElement = document.getElementById('countdown');
    const timer = document.getElementById('timer');
    
    if (!overlay) return;

    // Mostrar el popup al cargar
    state.maintenanceShown = true;
    document.body.style.overflow = 'hidden';

    // Countdown para mostrar el botón de cerrar
    let countdown = 2
    
    const interval = setInterval(() => {
      countdown--;
      if (timerElement) {
        timerElement.textContent = countdown;
      }
      
      if (countdown <= 0) {
        clearInterval(interval);
        if (closeBtn) {
          closeBtn.classList.add('show');
        }
        if (timer) {
          timer.style.display = 'none';
        }
      }
    }, 1000);

    // Función global para cerrar el popup
    window.closeMaintenancePopup = function() {
      if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
          overlay.style.display = 'none';
          document.body.style.overflow = '';
          state.maintenanceShown = false;
        }, 300);
      }
    };

    // Cerrar con ESC después del countdown
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && countdown <= 0 && state.maintenanceShown) {
        window.closeMaintenancePopup();
      }
    });
  };

  /**
   * Header sticky y navegación
   */
  const initHeader = () => {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.nav__toggle');
    const navWrapper = document.querySelector('.nav__wrapper');
    const links = document.querySelectorAll('.nav__link');
    const ctaButtons = document.querySelectorAll('.header__cta .btn');
    
    if (!header) return;

    // Scroll handling optimizado
    let lastScroll = 0;
    
    const handleScroll = throttle(() => {
      const currentScroll = window.pageYOffset;
      
      // Add scrolled class
      if (currentScroll > 100) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      
      // Hide/show on scroll direction
      if (currentScroll > lastScroll && currentScroll > 300 && !state.menuOpen) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
      
      lastScroll = currentScroll;
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Mobile menu toggle
    if (toggle && navWrapper) {
      const closeMenu = () => {
        if (state.menuOpen) {
          state.menuOpen = false;
          toggle.setAttribute('aria-expanded', false);
          navWrapper.classList.remove('is-active');
          document.body.style.overflow = '';
        }
      };

      toggle.addEventListener('click', () => {
        state.menuOpen = !state.menuOpen;
        toggle.setAttribute('aria-expanded', state.menuOpen);
        navWrapper.classList.toggle('is-active', state.menuOpen);
        document.body.style.overflow = state.menuOpen ? 'hidden' : '';
      });
      
      // Event delegation para links
      navWrapper.addEventListener('click', (e) => {
        if (e.target.matches('.nav__link, .btn')) {
          closeMenu();
        }
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (state.menuOpen && 
            !navWrapper.contains(e.target) && 
            !toggle.contains(e.target)) {
          closeMenu();
        }
      });
      
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (state.menuOpen && e.key === 'Escape') {
          closeMenu();
          toggle.focus();
        }
      });

      // Handle resize con debounce
      const handleResize = debounce(() => {
        if (window.innerWidth > 768 && state.menuOpen) {
          closeMenu();
        }
      }, 250);
      
      window.addEventListener('resize', handleResize, { passive: true });
    }
  };

  /**
   * Smooth scroll for anchor links
   */
  const initSmoothScroll = () => {
    if (state.prefersReducedMotion) return;
    
    // Event delegation para mejor performance
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
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
      
      // Update URL sin trigger scroll
      history.replaceState(null, '', targetId);
    });
  };

  /**
   * Carrusel optimizado con touch support
   */
  const initCarousel = (config) => {
    const { 
      trackId, 
      prevBtnId, 
      nextBtnId, 
      dotsSelector,
      cardSelector,
      stateKey,
      centerMode = false
    } = config;
    
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    
    if (!track) return;
    
    const cards = track.querySelectorAll(cardSelector);
    const dotsContainer = document.querySelector(dotsSelector);
    
    // Create dots
    if (dotsContainer && !dotsContainer.children.length) {
      cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Ir a elemento ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }
    
    const dots = dotsContainer?.querySelectorAll('button');
    
    const getMetrics = () => {
      const cardWidth = cards[0]?.getBoundingClientRect().width || 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 32;
      const containerWidth = track.parentElement?.clientWidth || 0;
      const visible = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
      const maxIndex = Math.max(0, cards.length - visible);
      return { cardWidth, gap, visible, maxIndex, containerWidth };
    };
    
    const updateCarousel = () => {
      const metrics = getMetrics();
      state[stateKey] = Math.max(0, Math.min(state[stateKey], metrics.maxIndex));
      
      if (centerMode) {
        // Centro para team carousel
        const centerOffset = (metrics.containerWidth - metrics.cardWidth) / 2;
        const translateX = -state[stateKey] * (metrics.cardWidth + metrics.gap) + centerOffset;
        track.style.transform = `translateX(${translateX}px)`;
        
        cards.forEach((card, i) => {
          card.classList.toggle('active', i === state[stateKey]);
        });
      } else {
        // Normal para funds carousel
        const translateX = -state[stateKey] * (metrics.cardWidth + metrics.gap);
        track.style.transform = `translateX(${translateX}px)`;
      }
      
      // Update dots
      dots?.forEach((dot, i) => {
        dot.classList.toggle('active', i === state[stateKey]);
      });
      
      // Update buttons
      if (prevBtn) prevBtn.disabled = state[stateKey] === 0;
      if (nextBtn) nextBtn.disabled = state[stateKey] >= (centerMode ? cards.length - 1 : metrics.maxIndex);
    };
    
    const goToSlide = (index) => {
      state[stateKey] = index;
      updateCarousel();
    };
    
    // Event listeners
    prevBtn?.addEventListener('click', () => {
      if (state[stateKey] > 0) {
        state[stateKey]--;
        updateCarousel();
      }
    });
    
    nextBtn?.addEventListener('click', () => {
      const maxIndex = centerMode ? cards.length - 1 : getMetrics().maxIndex;
      if (state[stateKey] < maxIndex) {
        state[stateKey]++;
        updateCarousel();
      }
    });
    
    // Touch support mejorado
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        const maxIndex = centerMode ? cards.length - 1 : getMetrics().maxIndex;
        if (diff > 0 && state[stateKey] < maxIndex) {
          state[stateKey]++;
        } else if (diff < 0 && state[stateKey] > 0) {
          state[stateKey]--;
        }
        updateCarousel();
      }
      
      isDragging = false;
    };
    
    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchmove', handleTouchMove, { passive: true });
    track.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Click on member to select (solo para team)
    if (centerMode) {
      cards.forEach((card, index) => {
        card.addEventListener('click', () => {
          if (state[stateKey] !== index) {
            goToSlide(index);
          }
        });
      });
    }
    
    // Resize handler con debounce
    const handleResize = debounce(updateCarousel, 150);
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initialize
    updateCarousel();
  };

  /**
   * Animated counter for stats con Intersection Observer
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
      
      let startTime = null;
      const startValue = 0;
      
      const step = (currentTime) => {
        if (!startTime) startTime = currentTime;
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
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    });
    
    statItems.forEach(item => observer.observe(item));
  };

  /**
   * Accordion for FAQ con event delegation
   */
  const initAccordion = () => {
    const accordion = document.querySelector('.accordion');
    if (!accordion) return;
    
    accordion.addEventListener('click', (e) => {
      const trigger = e.target.closest('.accordion__trigger');
      if (!trigger) return;
      
      const content = trigger.nextElementSibling;
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      
      // Close all others
      accordion.querySelectorAll('.accordion__trigger').forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherTrigger.nextElementSibling.hidden = true;
        }
      });
      
      // Toggle current
      trigger.setAttribute('aria-expanded', !isExpanded);
      content.hidden = isExpanded;
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
   * Lazy loading para imágenes no críticas
   */
  const initLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
      // Browser soporta lazy loading nativo
      return;
    }
    
    // Fallback con Intersection Observer
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  };

  /**
   * Initialize all components
   */
  const init = () => {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    console.log('BlackBird Capital - Initializing');
    
    // Popup de mantenimiento (primero)
    initMaintenancePopup();
    
    // Core functionality
    initHeader();
    initSmoothScroll();
    
    // Carousels
    initCarousel({
      trackId: 'funds-track',
      prevBtnId: 'prevBtn',
      nextBtnId: 'nextBtn',
      dotsSelector: '.funds__controls .carousel-dots',
      cardSelector: '.fund-card',
      stateKey: 'currentFundIndex',
      centerMode: false
    });
    
    initCarousel({
      trackId: 'teamTrack',
      prevBtnId: 'teamPrevBtn',
      nextBtnId: 'teamNextBtn',
      dotsSelector: '.team__controls .carousel-dots',
      cardSelector: '.team-member',
      stateKey: 'currentTeamIndex',
      centerMode: true
    });
    
    // Interactive elements
    initStats();
    initAccordion();
    initNewsletter();
    initLazyLoading();
    
    document.body.classList.add('js-initialized');
  };
  
  // Start the application
  init();
  
  // Public API
  window.BlackBirdCapital = {
    state,
    reinit: init,
    closeMaintenancePopup: window.closeMaintenancePopup
  };
})();