let duration = 800;
// Кастомная анимация плавного скролла с заданной длительностью
  function smoothScrollTo(targetPosition, callback) {
    const startTime = performance.now();
    const startPos = window.scrollY;

    function easeInOutQuad(t) {
      return t<0.5 ? 2*t*t : -1+(4-2*t)*t;
    }

    function animate(time) {
      let elapsed = time - startTime;
      let progress = Math.min(elapsed / duration, 1);
      let easeProgress = easeInOutQuad(progress);
      window.scrollTo(0, startPos + (targetPosition - startPos) * easeProgress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (callback) callback();
      }
    }

    requestAnimationFrame(animate);
  }

(() => {
  const blocks = document.querySelectorAll('.block');
  const headerHeight = document.querySelector('header').offsetHeight; // 10vh приблизительно
  let currentIndex = 0;
  let isScrolling = false;

  blocks[currentIndex].classList.add('active_block');

  window.addEventListener('wheel', (event) => {
    if (isScrolling) {
      event.preventDefault();
      return;
    }

    const delta = event.deltaY;
    if (delta === 0) return;

    if (delta > 0) {
      if (currentIndex < blocks.length - 1) {
        currentIndex++;
      }
    } else {
      if (currentIndex > 0) {
        currentIndex--;
      }
    }

    isScrolling = true;

    blocks.forEach((block, i) => {
      if (i === currentIndex) {
        block.classList.add('active_block');
      } else {
        block.classList.remove('active_block');
      }
    });

    const targetScroll = headerHeight + currentIndex * blocks[0].offsetHeight;

    smoothScrollTo(targetScroll, () => {
      isScrolling = false;
    });

    event.preventDefault();
  }, { passive: false });

  // При загрузке страницы отскроллим к первому блоку с учётом header
  window.scrollTo(0, headerHeight);
})();


(() => {
  const header = document.querySelector('header');

  let isHeaderVisible = true; // Флаг для отслеживания видимости header
  let scrollTimeout; // Для отслеживания завершения скролла

  // Функция для скрытия header
  function hideHeader() {
    if (isHeaderVisible) {
      header.style.transition = 'opacity 0.2s ease'; // Скрытие за 200 мс
      header.style.opacity = '0';
      isHeaderVisible = false;
    }
  }

  // Функция для показа header
  function showHeader() {
    if (!isHeaderVisible) {
      header.style.transition = 'opacity 0.3s ease'; // Появление за 300 мс
      header.style.opacity = '1';
      isHeaderVisible = true;
    }
  }

  // Функция для очистки стилей
  function clearHeader() {
    setTimeout(() => {
      header.removeAttribute('style'); // Удаляем все встроенные стили
    }, 300); // Задержка соответствует времени появления (300 мс)
  }

  // Обработчик события прокрутки
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout); // Очистка предыдущего таймера

    // Скрываем header при начале скролла
    hideHeader();

    // Показываем header после завершения скролла
    scrollTimeout = setTimeout(() => {
      showHeader();
      clearHeader(); // Очищаем стили после завершения анимации
    }, 300); // Задержка перед появлением (300 мс)
  });
})();

document.addEventListener('DOMContentLoaded', function () {
    const heroTitle = document.querySelector('.hero-content h1');
    const headerHeight = document.querySelector('header').offsetHeight; // Высота шапки
    const blocks = document.querySelectorAll('.block'); // Все блоки с классом .block

    // Обработчик клика на заголовке
    heroTitle.addEventListener('click', function () {
        // Находим следующий блок после .hero
        const nextBlock = document.querySelector('.hero + .block');
        if (!nextBlock) return;

        // Делаем все блоки невидимыми
        blocks.forEach(block => block.classList.remove('active_block'));

        // Делаем следующий блок видимым
        nextBlock.classList.add('active_block');

        // Вычисляем целевую позицию для прокрутки
        const targetPosition = nextBlock.offsetTop;

        // Используем вашу функцию smoothScrollTo
        smoothScrollTo(targetPosition);
    });
});