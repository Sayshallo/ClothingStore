document.addEventListener('DOMContentLoaded', function () {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const productName = card.querySelector('.product-name');
        const productImage = card.querySelector('img');
        const originalName = productName.textContent;

        // Функция, которая вычисляет максимальную длину названия в зависимости от ширины карточки
        function calculateMaxLength() {
            const cardWidth = card.clientWidth;
            const approxCharWidth = 8; // Приблизительная ширина одного символа
            const safetyFactor = 0.78; // Коэффициент безопасности
            let maxChars = Math.floor(cardWidth / approxCharWidth * safetyFactor);
            if (maxChars < 10) maxChars = 10;
            if (maxChars > 40) maxChars = 40;
            return maxChars;
        }

        // Функция отображает название с обрезкой или полное
        function applyText() {
            const maxLength = calculateMaxLength();
            if (originalName.length > maxLength) {
                productName.textContent = originalName.slice(0, maxLength) + '...';
                productName.classList.add('long-name'); // Добавляем класс для длинных названий
            } else {
                productName.textContent = originalName;
                productName.classList.remove('long-name'); // Удаляем класс для длинных названий
            }
        }

        // Инициализация
        applyText();

        // Обновлять при изменении размера окна
        window.addEventListener('resize', () => {
            applyText();
        });

        // При наведении показываем полное название
        card.addEventListener('mouseenter', () => {
            if (productName.classList.contains('long-name')) {
                productName.textContent = originalName; // Показываем полное название только для длинных названий
            }
            productImage.style.filter = 'brightness(0.7)'; // Затемняем изображение
        });

        // При убирании курсора восстанавливаем обрезанное название
        card.addEventListener('mouseleave', () => {
            applyText(); // Восстанавливаем троеточие, если нужно
            productImage.style.filter = ''; // Отменяем затемнение
        });
    });
});