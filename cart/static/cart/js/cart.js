    const checkboxes = document.querySelectorAll('.cart-item-checkbox');
    const hiddenInputsContainer = document.getElementById('hidden-inputs');
    const checkoutForm = document.getElementById('checkout-form');
    const totalOrderCostElement = document.getElementById('total-order-cost');

    // Показываем форму, если хотя бы один товар выбран
    function updateFormVisibility() {
        const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        checkoutForm.style.display = anyChecked ? 'block' : 'none';
    }

    // Обновление общей стоимости заказа
    function updateTotalOrderCost() {
        let totalCost = 0;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const row = checkbox.closest('tr');
                const cost = parseFloat(row.querySelector('.item-total-cost').textContent);
                totalCost += cost;
            }
        });
        totalOrderCostElement.textContent = `Общая стоимость: ${totalCost.toFixed(2)} рублей`;
        let totalCostInput = document.querySelector('#checkout-form input[name="total_cost"]');
        totalCostInput.value = totalCost.toFixed(2);
    }

    // Пересчет стоимости товара
    function recalculateRowCost(row) {
        const pricePerUnit = parseFloat(row.dataset.price);
        const quantity = parseInt(row.querySelector('.quantity').textContent);
        const totalCost = (pricePerUnit * quantity).toFixed(2);
        row.querySelector('.item-total-cost').textContent = totalCost;

        // Обновляем общую стоимость заказа
        updateTotalOrderCost();
    }

// Управление количеством товаров
document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // Предотвращаем отправку формы

        const cell = button.closest('td'); // Находим ячейку
        const form = cell.querySelector('.product-form'); // Находим форму внутри ячейки

        if (!form) {
            console.error("Форма не найдена!");
            return;
        }

        const quantityElement = cell.querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent);

        if (button.dataset.action === 'increase') {
            quantity += 1;
        } else if (button.dataset.action === 'decrease' && quantity > 1) {
            quantity -= 1;
        }

        // Обновляем значение в скрытом поле new_qnt
        const newQntInput = form.querySelector('input[name="new_qnt"]');
        if (!newQntInput) {
            console.error("Поле new_qnt не найдено!");
            return;
        }
        newQntInput.value = quantity;

        // Отправляем форму после обновления значения
        form.submit();
    });
});

// Удаление товара из корзины
document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // Предотвращаем отправку формы

        const cell = button.closest('td'); // Находим ячейку
        const form = cell.querySelector('.product-form'); // Находим форму внутри ячейки

        if (!form) {
            console.error("Форма не найдена!");
            return;
        }

        // Устанавливаем значение 0 в скрытое поле new_qnt
        const newQntInput = form.querySelector('input[name="new_qnt"]');
        if (!newQntInput) {
            console.error("Поле new_qnt не найдено!");
            return;
        }
        newQntInput.value = "0";

        // Отправляем форму после обновления значения
        form.submit();
    });
});

    // Добавляем обработчик изменения состояния чекбоксов
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Очищаем контейнер скрытых input
            hiddenInputsContainer.innerHTML = '';

            // Добавляем скрытые input только для выбранных товаров
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = 'selected_items';
                    hiddenInput.value = checkbox.value;
                    hiddenInputsContainer.appendChild(hiddenInput);
                }
            });

            // Обновляем видимость формы и общую стоимость
            updateFormVisibility();
            updateTotalOrderCost();
        });
    });

    // Инициализация видимости формы и общей стоимости при загрузке страницы
    updateFormVisibility();
    updateTotalOrderCost();


    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('#cart-items tr').forEach(row => {
            const price = parseFloat(row.dataset.price);
            const quantity = parseInt(row.querySelector('.quantity').textContent);
            const totalCost = (price * quantity).toFixed(2);
            row.querySelector('.item-total-cost').textContent = totalCost;
        });
    });

document.addEventListener('DOMContentLoaded', function () {
    let totalOrderCost = 0;

    document.querySelectorAll('#cart-items tr').forEach(row => {
        const price = parseFloat(row.dataset.price);
        const quantity = parseInt(row.querySelector('.quantity').textContent);
        const totalCost = price * quantity;
        row.querySelector('.item-total-cost').textContent = totalCost.toFixed(2);

        // Суммируем общую стоимость
        totalOrderCost += totalCost;
    });

    // Обновляем блок с общей стоимостью
    document.getElementById('total-order-cost').textContent = `Общая стоимость: ${totalOrderCost.toFixed(2)} рублей`;

    let totalCostInput = document.querySelector('#checkout-form input[name="total_cost"]');
    totalCostInput.value = totalOrderCost.toFixed(2);

    checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = 'selected_items';
                    hiddenInput.value = checkbox.value;
                    hiddenInputsContainer.appendChild(hiddenInput);
                }
            });
});