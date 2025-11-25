/**
 * BlackBird Capital - JavaScript Optimizado y Corregido
 * Versión: 2.0
 * Funcionalidad completa con mejoras de UX/UI
 */

(function() {
  'use strict';

  // ==========================================================================
  // 1. ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================================================
  const state = {
    menuOpen: false,
    currentFundIndex: 0,
    currentTeamIndex: 0,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    modalOpen: false
  };

  // ==========================================================================
  // 2. UTILIDADES
  // ==========================================================================
  
  /**
   * Debounce para optimizar eventos de resize
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
   * Throttle para eventos de scroll
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

  // ==========================================================================
  // 3. HEADER Y NAVEGACIÓN MEJORADA
  // ==========================================================================
  const initHeader = () => {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.nav__toggle');
    const navWrapper = document.querySelector('.nav__wrapper');
    const navLinks = document.querySelectorAll('.nav__link');
    
    if (!header) return;

    // Manejo del scroll con throttle
    let lastScroll = 0;
    
    const handleScroll = throttle(() => {
      const currentScroll = window.pageYOffset;
      
      // Añadir clase cuando se hace scroll
      if (currentScroll > 100) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      
      // Ocultar/mostrar header según dirección del scroll
      if (currentScroll > lastScroll && currentScroll > 300 && !state.menuOpen) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
      
      lastScroll = currentScroll;
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Toggle del menú móvil - CORREGIDO
    if (toggle && navWrapper) {
      const openMenu = () => {
        state.menuOpen = true;
        toggle.setAttribute('aria-expanded', 'true');
        navWrapper.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      };

      const closeMenu = () => {
        state.menuOpen = false;
        toggle.setAttribute('aria-expanded', 'false');
        navWrapper.classList.remove('is-active');
        document.body.style.overflow = '';
      };

      // Click en el botón toggle
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });
      
      // Cerrar al hacer click en los links
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (state.menuOpen) {
            closeMenu();
          }
        });
      });

      // Cerrar al hacer click en los botones CTA
      const ctaButtons = document.querySelectorAll('.header__cta .btn');
      ctaButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (state.menuOpen) {
            closeMenu();
          }
        });
      });
      
      // Cerrar al hacer click fuera
      document.addEventListener('click', (e) => {
        if (state.menuOpen && 
            !navWrapper.contains(e.target) && 
            !toggle.contains(e.target)) {
          closeMenu();
        }
      });
      
      // Cerrar con ESC
      document.addEventListener('keydown', (e) => {
        if (state.menuOpen && e.key === 'Escape') {
          closeMenu();
          toggle.focus();
        }
      });

      // Manejar resize
      const handleResize = debounce(() => {
        if (window.innerWidth > 1023 && state.menuOpen) {
          closeMenu();
        }
      }, 250);
      
      window.addEventListener('resize', handleResize, { passive: true });
    }
  };

  // ==========================================================================
  // 4. SMOOTH SCROLL MEJORADO
  // ==========================================================================
  const initSmoothScroll = () => {
    if (state.prefersReducedMotion) return;
    
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
      
      // Actualizar URL sin hacer scroll
      history.replaceState(null, '', targetId);
    });
  };

  // ==========================================================================
  // 5. CARRUSEL UNIVERSAL MEJORADO
  // ==========================================================================

    // 5. CARRUSEL UNIVERSAL MEJORADO
  // ==========================================================================
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
    
    // Crear dots si no existen
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
    
    // // --- NUEVO: modo estático cuando hay pocos ítems (por ejemplo < 4 fondos) ---
    // const minSlidesForCarousel = centerMode ? 1 : 4; // para fondos: mínimo 4
    // const isStaticLayout = !centerMode && cards.length < minSlidesForCarousel;

    // if (isStaticLayout) {
    //   // centramos las cards y apagamos cualquier transform
    //   track.style.justifyContent = 'center';
    //   track.style.transform = 'none';

    //   // ocultamos controles
    //   if (prevBtn) prevBtn.style.display = 'none';
    //   if (nextBtn) nextBtn.style.display = 'none';
    //   if (dotsContainer) dotsContainer.style.display = 'none';
    // }
    
    // --- Modo estático solo en desktop cuando hay pocos ítems ---
    // Si es un carrusel normal (fondos), solo es estático en desktop y solo si hay menos de 4 tarjetas.
    const DESKTOP_WIDTH = 1024;
    const minSlidesForCarousel = centerMode ? 1 : (window.innerWidth >= DESKTOP_WIDTH ? 4 : 1);

    const isStaticLayout =
      !centerMode &&
      cards.length < minSlidesForCarousel &&
      window.innerWidth >= DESKTOP_WIDTH;

    if (isStaticLayout) {
      track.style.justifyContent = 'center';
      track.style.transform = 'none';

      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (dotsContainer) dotsContainer.style.display = 'none';
    }

    
    // Calcular métricas del carrusel
    const getMetrics = () => {
      if (isStaticLayout) {
        return { cardWidth: 0, gap: 0, visible: 1, maxIndex: 0, containerWidth: 0 };
      }

      const activeIndex = state[stateKey] || 0;
      const sampleCard = cards[activeIndex] || cards[0];
      
      if (!sampleCard) return { cardWidth: 0, gap: 0, visible: 1, maxIndex: 0, containerWidth: 0 };
      
      const cardWidth = sampleCard.offsetWidth;
      const gap = parseFloat(getComputedStyle(track).gap) || 32;
      const containerWidth = track.parentElement?.clientWidth || 0;
      
      // Calcular tarjetas visibles
      let visible = 1;
      if (!centerMode) {
        visible = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
      }
      
      // Índice máximo
      const maxIndex = centerMode 
        ? Math.max(0, cards.length - 1)
        : Math.max(0, cards.length - visible);
      
      return { cardWidth, gap, visible, maxIndex, containerWidth };
    };
    
    // Actualizar el carrusel
    const updateCarousel = () => {
      if (isStaticLayout) return;

      const metrics = getMetrics();
      state[stateKey] = Math.max(0, Math.min(state[stateKey], metrics.maxIndex));
      
      if (centerMode) {
        // Centrar la tarjeta activa
        const centerOffset = (metrics.containerWidth - metrics.cardWidth) / 2;
        const translateX = -state[stateKey] * (metrics.cardWidth + metrics.gap) + centerOffset;
        track.style.transform = `translateX(${translateX}px)`;
        
        // Actualizar clase activa
        cards.forEach((card, i) => {
          card.classList.toggle('active', i === state[stateKey]);
        });
      } else {
        // Carrusel normal
        const translateX = -state[stateKey] * (metrics.cardWidth + metrics.gap);
        track.style.transform = `translateX(${translateX}px)`;
      }
      
      // Actualizar dots
      dots?.forEach((dot, i) => {
        dot.classList.toggle('active', i === state[stateKey]);
      });
      
      // Actualizar botones
      if (prevBtn) prevBtn.disabled = state[stateKey] === 0;
      if (nextBtn) nextBtn.disabled = state[stateKey] >= metrics.maxIndex;
    };
    
    // Ir a una tarjeta específica
    const goToSlide = (index) => {
      if (isStaticLayout) return;
      const { maxIndex } = getMetrics();
      state[stateKey] = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
    };
    
    // Event listeners para los botones
    if (!isStaticLayout) {
      prevBtn?.addEventListener('click', () => {
        if (state[stateKey] > 0) {
          state[stateKey]--;
          updateCarousel();
        }
      });
      
      nextBtn?.addEventListener('click', () => {
        const { maxIndex } = getMetrics();
        if (state[stateKey] < maxIndex) {
          state[stateKey]++;
          updateCarousel();
        }
      });
    }
    
    // Soporte táctil mejorado
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const handleTouchStart = (e) => {
      if (isStaticLayout) return;
      startX = e.touches[0].clientX;
      isDragging = true;
      track.style.cursor = 'grabbing';
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging || isStaticLayout) return;
      currentX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      if (!isDragging || isStaticLayout) return;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      const { maxIndex } = getMetrics();
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && state[stateKey] < maxIndex) {
          state[stateKey]++;
        } else if (diff < 0 && state[stateKey] > 0) {
          state[stateKey]--;
        }
        updateCarousel();
      }
      
      isDragging = false;
      track.style.cursor = '';
    };
    
    // Eventos táctiles
    if (!isStaticLayout) {
      track.addEventListener('touchstart', handleTouchStart, { passive: true });
      track.addEventListener('touchmove', handleTouchMove, { passive: true });
      track.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Soporte para mouse (drag)
    track.addEventListener('mousedown', (e) => {
      if (isStaticLayout) return;
      startX = e.clientX;
      isDragging = true;
      track.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    track.addEventListener('mousemove', (e) => {
      if (!isDragging || isStaticLayout) return;
      currentX = e.clientX;
    });
    
    track.addEventListener('mouseup', () => {
      if (!isDragging || isStaticLayout) return;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      const { maxIndex } = getMetrics();
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && state[stateKey] < maxIndex) {
          state[stateKey]++;
        } else if (diff < 0 && state[stateKey] > 0) {
          state[stateKey]--;
        }
        updateCarousel();
      }
      
      isDragging = false;
      track.style.cursor = '';
    });
    
    track.addEventListener('mouseleave', () => {
      isDragging = false;
      track.style.cursor = '';
    });
    
    // Click en tarjetas para modo centro
    if (centerMode) {
      cards.forEach((card, index) => {
        card.addEventListener('click', () => {
          if (state[stateKey] !== index) {
            goToSlide(index);
          }
        });
      });
    }
    
    // Manejar resize
    const handleResize = debounce(updateCarousel, 150);
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Inicializar
    if (!isStaticLayout) {
      updateCarousel();
    }
  };
  

  // const initCarousel = (config) => {
  //   const { 
  //     trackId, 
  //     prevBtnId, 
  //     nextBtnId, 
  //     dotsSelector,
  //     cardSelector,
  //     stateKey,
  //     centerMode = false
  //   } = config;
    
  //   const track = document.getElementById(trackId);
  //   const prevBtn = document.getElementById(prevBtnId);
  //   const nextBtn = document.getElementById(nextBtnId);
    
  //   if (!track) return;
    
  //   const cards = track.querySelectorAll(cardSelector);
  //   const dotsContainer = document.querySelector(dotsSelector);
    
  //   // Crear dots si no existen
  //   if (dotsContainer && !dotsContainer.children.length) {
  //     cards.forEach((_, index) => {
  //       const dot = document.createElement('button');
  //       dot.setAttribute('aria-label', `Ir a elemento ${index + 1}`);
  //       if (index === 0) dot.classList.add('active');
  //       dot.addEventListener('click', () => goToSlide(index));
  //       dotsContainer.appendChild(dot);
  //     });
  //   }
    
  //   const dots = dotsContainer?.querySelectorAll('button');
    
  //   // Calcular métricas del carrusel
  //   const getMetrics = () => {
  //     const activeIndex = state[stateKey] || 0;
  //     const sampleCard = cards[activeIndex] || cards[0];
      
  //     if (!sampleCard) return { cardWidth: 0, gap: 0, visible: 1, maxIndex: 0, containerWidth: 0 };
      
  //     const cardWidth = sampleCard.offsetWidth;
  //     const gap = parseFloat(getComputedStyle(track).gap) || 32;
  //     const containerWidth = track.parentElement?.clientWidth || 0;
      
  //     // Calcular tarjetas visibles
  //     let visible = 1;
  //     if (!centerMode) {
  //       visible = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
  //     }
      
  //     // Índice máximo
  //     const maxIndex = centerMode 
  //       ? Math.max(0, cards.length - 1)
  //       : Math.max(0, cards.length - visible);
      
  //     return { cardWidth, gap, visible, maxIndex, containerWidth };
  //   };
    
  //   // Actualizar el carrusel
  //   const updateCarousel = () => {
  //     const metrics = getMetrics();
  //     state[stateKey] = Math.max(0, Math.min(state[stateKey], metrics.maxIndex));
      
  //     if (centerMode) {
  //       // Centrar la tarjeta activa
  //       const centerOffset = (metrics.containerWidth - metrics.cardWidth) / 2;
  //       const translateX = -state[stateKey] * (metrics.cardWidth + metrics.gap) + centerOffset;
  //       track.style.transform = `translateX(${translateX}px)`;
        
  //       // Actualizar clase activa
  //       cards.forEach((card, i) => {
  //         card.classList.toggle('active', i === state[stateKey]);
  //       });
  //     } else {
  //       // Carrusel normal
  //       const translateX = -state[stateKey] * (metrics.cardWidth + metrics.gap);
  //       track.style.transform = `translateX(${translateX}px)`;
  //     }
      
  //     // Actualizar dots
  //     dots?.forEach((dot, i) => {
  //       dot.classList.toggle('active', i === state[stateKey]);
  //     });
      
  //     // Actualizar botones
  //     if (prevBtn) prevBtn.disabled = state[stateKey] === 0;
  //     if (nextBtn) nextBtn.disabled = state[stateKey] >= metrics.maxIndex;
  //   };
    
  //   // Ir a una tarjeta específica
  //   const goToSlide = (index) => {
  //     const { maxIndex } = getMetrics();
  //     state[stateKey] = Math.max(0, Math.min(index, maxIndex));
  //     updateCarousel();
  //   };
    
  //   // Event listeners para los botones
  //   prevBtn?.addEventListener('click', () => {
  //     if (state[stateKey] > 0) {
  //       state[stateKey]--;
  //       updateCarousel();
  //     }
  //   });
    
  //   nextBtn?.addEventListener('click', () => {
  //     const { maxIndex } = getMetrics();
  //     if (state[stateKey] < maxIndex) {
  //       state[stateKey]++;
  //       updateCarousel();
  //     }
  //   });
    
  //   // Soporte táctil mejorado
  //   let startX = 0;
  //   let currentX = 0;
  //   let isDragging = false;
    
  //   const handleTouchStart = (e) => {
  //     startX = e.touches[0].clientX;
  //     isDragging = true;
  //     track.style.cursor = 'grabbing';
  //   };
    
  //   const handleTouchMove = (e) => {
  //     if (!isDragging) return;
  //     currentX = e.touches[0].clientX;
  //   };
    
  //   const handleTouchEnd = () => {
  //     if (!isDragging) return;
      
  //     const diff = startX - currentX;
  //     const threshold = 50;
      
  //     const { maxIndex } = getMetrics();
  //     if (Math.abs(diff) > threshold) {
  //       if (diff > 0 && state[stateKey] < maxIndex) {
  //         state[stateKey]++;
  //       } else if (diff < 0 && state[stateKey] > 0) {
  //         state[stateKey]--;
  //       }
  //       updateCarousel();
  //     }
      
  //     isDragging = false;
  //     track.style.cursor = '';
  //   };
    
  //   // Eventos táctiles
  //   track.addEventListener('touchstart', handleTouchStart, { passive: true });
  //   track.addEventListener('touchmove', handleTouchMove, { passive: true });
  //   track.addEventListener('touchend', handleTouchEnd, { passive: true });
    
  //   // Soporte para mouse (drag)
  //   track.addEventListener('mousedown', (e) => {
  //     startX = e.clientX;
  //     isDragging = true;
  //     track.style.cursor = 'grabbing';
  //     e.preventDefault();
  //   });
    
  //   track.addEventListener('mousemove', (e) => {
  //     if (!isDragging) return;
  //     currentX = e.clientX;
  //   });
    
  //   track.addEventListener('mouseup', () => {
  //     if (!isDragging) return;
      
  //     const diff = startX - currentX;
  //     const threshold = 50;
      
  //     const { maxIndex } = getMetrics();
  //     if (Math.abs(diff) > threshold) {
  //       if (diff > 0 && state[stateKey] < maxIndex) {
  //         state[stateKey]++;
  //       } else if (diff < 0 && state[stateKey] > 0) {
  //         state[stateKey]--;
  //       }
  //       updateCarousel();
  //     }
      
  //     isDragging = false;
  //     track.style.cursor = '';
  //   });
    
  //   track.addEventListener('mouseleave', () => {
  //     isDragging = false;
  //     track.style.cursor = '';
  //   });
    
  //   // Click en tarjetas para modo centro
  //   if (centerMode) {
  //     cards.forEach((card, index) => {
  //       card.addEventListener('click', () => {
  //         if (state[stateKey] !== index) {
  //           goToSlide(index);
  //         }
  //       });
  //     });
  //   }
    
  //   // Manejar resize
  //   const handleResize = debounce(updateCarousel, 150);
  //   window.addEventListener('resize', handleResize, { passive: true });
    
  //   // Inicializar
  //   updateCarousel();
  // };

  // ==========================================================================
  // 6. MODAL DEL EQUIPO - CORREGIDO Y SIMPLIFICADO
  // ==========================================================================
  const initTeamModal = () => {
    const modal = document.getElementById('teamModal');
    if (!modal) return;
    
    const overlay = modal.querySelector('.team-modal__overlay');
    const closeBtn = modal.querySelector('.team-modal__close');
    const modalTitle = document.getElementById('modalTitle');
    const modalRole = document.getElementById('modalRole');
    const modalBody = document.getElementById('modalBody');
    const modalImage = document.getElementById('modalImage');
    
    // Datos completos del equipo con imágenes
    const teamData = {
      jrg: {
        name: 'Jorge Ramírez G.',
        role: 'Socio & Presidente',
        image: 'assets/imagenes/Foto JRG Web.jpg',
        content: `
          <ul>
            <li><strong>Socio & Presidente</strong> – BlackBird Capital S.A.</li>
            <li>40+ años de experiencia en capital privado, finanzas corporativas y derivados financieros.</li>
          </ul>
        `
      },
      jrp: {
        name: 'Jorge Ramírez P.',
        role: 'Socio & CEO',
        image: 'assets/imagenes/Foto JRP Web.jpg',
        content: `
          <ul>
            <li><strong>Socio & CEO</strong> – BlackBird Capital S.A.</li>
            <li>16+ años de experiencia en finanzas corporativas e inversiones</li>
            <li><strong>Pontificia Universidad Católica de Chile</strong> – Ingeniero Civil Industrial</li>
            <li><strong>Columbia University</strong> – MBA</li>
            <li>Anteriormente <strong>CFO & Investment Manager</strong> en Grupo Bancard</li>
            <li>Anteriormente <strong>CFO</strong> en Houm Group Inc.</li>
          </ul>
        `
      }
    };
    
    // Función para abrir el modal
    const openModal = (memberId) => {
      const data = teamData[memberId];
      if (!data) return;
      
      // Actualizar contenido del modal
      modalTitle.textContent = data.name;
      modalRole.textContent = data.role;
      modalBody.innerHTML = data.content;
      
      // Actualizar imagen
      if (modalImage) {
        modalImage.src = data.image;
        modalImage.alt = data.name;
      }
      
      // Mostrar modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      state.modalOpen = true;
      
      // Focus trap
      setTimeout(() => closeBtn.focus(), 100);
    };
    
    // Función para cerrar el modal
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      state.modalOpen = false;
    };
    
    // Event listeners para botones de detalles
    const detailButtons = document.querySelectorAll('.team-member__details-btn');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const memberId = btn.getAttribute('data-member');
        openModal(memberId);
      });
    });
    
    // Cerrar con el botón X
    closeBtn?.addEventListener('click', closeModal);
    
    // Cerrar al hacer click en el overlay
    overlay?.addEventListener('click', closeModal);
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (state.modalOpen && e.key === 'Escape') {
        closeModal();
      }
    });
  };

  // ==========================================================================
  // 7. CONTADOR ANIMADO (PARA ESTADÍSTICAS - COMENTADO)
  // ==========================================================================
  /*
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
        const eased = 1 - Math.pow(1 - progress, 3);
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
  */

  // ==========================================================================
  // 8. ACCORDION FAQ
  // ==========================================================================
  const initAccordion = () => {
    const accordion = document.querySelector('.accordion');
    if (!accordion) return;
    
    accordion.addEventListener('click', (e) => {
      const trigger = e.target.closest('.accordion__trigger');
      if (!trigger) return;
      
      const content = trigger.nextElementSibling;
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      
      // Cerrar todos los demás
      accordion.querySelectorAll('.accordion__trigger').forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherContent = otherTrigger.nextElementSibling;
          if (otherContent) {
            otherContent.hidden = true;
          }
        }
      });
      
      // Toggle el actual
      trigger.setAttribute('aria-expanded', !isExpanded);
      if (content) {
        content.hidden = isExpanded;
      }
    });
  };

  // ==========================================================================
  // 9. FORMULARIO NEWSLETTER
  // ==========================================================================
  const initNewsletter = () => {
    const form = document.querySelector('.newsletter__form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const button = form.querySelector('button');
      const input = form.querySelector('input');
      const originalText = button.textContent;
      
      // Validación básica
      if (!input.value || !input.value.includes('@')) {
        input.focus();
        return;
      }
      
      // Feedback visual
      button.textContent = '✓ Suscrito';
      button.disabled = true;
      button.style.background = 'var(--color-terracota)';
      
      // Reset después de 3 segundos
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.background = '';
        form.reset();
      }, 3000);
    });
  };

  // ==========================================================================
  // 10. LAZY LOADING DE IMÁGENES
  // ==========================================================================
  const initLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
      // El navegador soporta lazy loading nativo
      return;
    }
    
    // Fallback con Intersection Observer
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    images.forEach(img => imageObserver.observe(img));
  };

  // ==========================================================================
  // 11. INICIALIZACIÓN PRINCIPAL
  // ==========================================================================
  const init = () => {
    // Verificar si el DOM está listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    console.log('🚀 BlackBird Capital - Inicializando v2.0');
    
    // Inicializar componentes principales
    initHeader();
    initSmoothScroll();
    
    // Inicializar carrusel de fondos
    initCarousel({
      trackId: 'funds-track',
      prevBtnId: 'prevBtn',
      nextBtnId: 'nextBtn',
      dotsSelector: '.funds__controls .carousel-dots',
      cardSelector: '.fund-card',
      stateKey: 'currentFundIndex',
      centerMode: false
    });
    
    // Inicializar carrusel del equipo
    initCarousel({
      trackId: 'teamTrack',
      prevBtnId: 'teamPrevBtn',
      nextBtnId: 'teamNextBtn',
      dotsSelector: '.team__controls .carousel-dots',
      cardSelector: '.team-member',
      stateKey: 'currentTeamIndex',
      centerMode: true
    });
    
    // Inicializar modal del equipo
    initTeamModal();
    
    // Inicializar elementos interactivos
    // initStats(); // Comentado temporalmente
    initAccordion();
    initNewsletter();
    initLazyLoading();
    
    // Marcar como inicializado
    document.body.classList.add('js-initialized');
    
    console.log('✅ BlackBird Capital - Inicialización completa');
  };
  
  // ==========================================================================
  // 12. ARRANQUE DE LA APLICACIÓN
  // ==========================================================================
  init();
  
  // ==========================================================================
  // 13. API PÚBLICA (OPCIONAL)
  // ==========================================================================
  window.BlackBirdCapital = {
    state,
    reinit: init,
    version: '2.0.0'
  };
  
})();