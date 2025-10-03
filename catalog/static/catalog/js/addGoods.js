// + and -
document.addEventListener('DOMContentLoaded', function () {
    const isAuthenticated = document.body.dataset.isAuthenticated === 'true';

    const btnPlus = document.querySelector('.btn-plus');
    const btnMinus = document.querySelector('.btn-minus');
    const countElement = document.querySelector('.count');
    const deleteBtn = document.querySelector('.delete-btn');
    const selectedCountInput = document.getElementById('plus-selected-count');
    const plusForm = document.getElementById('plus-form');
    const notification = document.getElementById('notification');
    const cartCount = document.getElementById('cart-selected-quantity');

    const selectedSizeInput = document.getElementById('cart-selected-size');
    const selectedColorInput = document.getElementById('cart-selected-color');
    const inventoryDataElement = document.getElementById('inventory-data');

    if (!inventoryDataElement || !inventoryDataElement.dataset.inventory) {
        console.error('Inventory data is missing or invalid.');
        return;
    }

    let rawInventoryData = inventoryDataElement.dataset.inventory.replace(/\\u0027/g, '"');
    rawInventoryData = rawInventoryData.replace(/(\d+):/g, '"$1":');
    const inventoryData = JSON.parse(rawInventoryData);

    let count = 0;

    // +
    btnPlus.addEventListener('click', () => {
        if (!isAuthenticated) {
            showNotification();
        } else {
            const selectedSize = selectedSizeInput.value;
            const selectedColor = selectedColorInput.value;

            const firstProductId = Object.keys(inventoryData)[0];
            const availableQuantity = inventoryData[firstProductId]?.[selectedSize]?.[selectedColor] || 0;

            if (count >= availableQuantity) {
                alert('Недостаточно товара на складе.');
                return;
            }

            count++;
            updateUI();
        }
    });

    // -
    btnMinus.addEventListener('click', () => {
        if (isAuthenticated && count > 0) {
            // Если пользователь авторизован и счетчик больше 0, уменьшаем его
            count--;
            updateUI();
        }
    });

    deleteBtn.addEventListener('click', () => {
        if (count > 0) {
            count = 0;
            updateUI();
        }
    });

    // Функция для обновления интерфейса
    function updateUI() {
        countElement.textContent = count;
        cartCount.value = count;
        const addToCartBtn = document.querySelector('.add-to-cart-btn');

        if (count === 1) {
            addToCartBtn.classList.add('show');
            deleteBtn.classList.add('show');
            // Уменьшаем кнопку "+" и перемещаем её влево
            btnPlus.style.width = '20%'; // Уменьшаем ширину
            btnPlus.textContent = "+"; // Уменьшаем ширину

            // Показываем счетчик
            countElement.style.transition = '0.3s ease';
            countElement.style.opacity = '1';
            countElement.style.display = 'block';

            // Показываем кнопку "-" с анимацией
            setTimeout(() => {
                btnMinus.style.display = 'inline-block';
                btnMinus.style.opacity = '1';
                btnMinus.style.transform = 'scale(1)';
                btnMinus.style.position = 'relative';
            }, 100);
        } else if (count === 0) {
            addToCartBtn.classList.remove('show');
            deleteBtn.classList.remove('show');
            // Скрываем кнопку "-" с анимацией
            btnMinus.style.opacity = '0';
            btnMinus.style.transform = 'scale(0)';
            setTimeout(() => {
                btnPlus.textContent = "Добавить в корзину";
                btnMinus.style.position = 'absolute';
            }, 100);

            // Скрываем счетчик
            countElement.style.opacity = '0';
            countElement.style.display = 'none';

            // Возвращаем кнопку "+" в исходное состояние
            btnPlus.style.width = '100%';
            btnPlus.style.transform = 'translateX(0)';
        }
    }

    // Функция для показа уведомления
    function showNotification() {
            // Очищаем предыдущие таймеры и анимации
            clearTimeout(notification.timer); // Очищаем таймер исчезновения
            notification.classList.remove('fade-out'); // Убираем класс исчезновения

            // Показываем уведомление
            notification.style.display = 'block';
            notification.classList.add('show');

            // Устанавливаем новый таймер для скрытия уведомления
            notification.timer = setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 500); // Время анимации (0.5 секунды)
            }, 3000);
        }
});