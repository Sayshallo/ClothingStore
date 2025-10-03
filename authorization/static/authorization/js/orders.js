document.addEventListener('DOMContentLoaded', function () {
    const activeOrdersList = document.getElementById('active-orders-list');
    const completedOrdersList = document.getElementById('completed-orders-list');

    // Функция для форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    // Функция для загрузки данных о заказах
    function loadOrders(status, container) {
        fetch(`${getOrderUrl}?status=${status}`)
            .then(response => response.json())
            .then(data => {
                container.innerHTML = ''; // Очищаем контейнер
                if (data.length === 0) {
                    container.innerHTML = '<p>Нет заказов</p>';
                    return;
                }
                data.forEach(order => {
                    const row = document.createElement('div');
                    row.className = 'order-row';
                    row.setAttribute('data-order-id', order.id); // Добавляем ID заказа как атрибут
                    row.innerHTML = `
                        <h4>${order.status}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p>Заказ от ${formatDate(order.order_date)}</p>
                            <span>${order.total_price} руб.</span>
                        </div>
                    `;
                    container.appendChild(row);

                    // Добавляем обработчик клика для строки заказа
                    row.addEventListener('click', function () {
                        openOrderDetailsModal(order.id);
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка при загрузке заказов:', error);
                container.innerHTML = '<p>Ошибка при загрузке данных</p>';
            });
    }

    // Функция для открытия модального окна с деталями заказа
    function openOrderDetailsModal(orderId) {
    const orderHistoryModal = bootstrap.Modal.getInstance(document.getElementById('orderHistoryModal')); // Получаем экземпляр первого модального окна
    const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal')); // Создаем экземпляр второго модального окна
    const detailsContent = document.getElementById('order-details-table-body'); // Находим tbody таблицы

    // Скрываем первое модальное окно
    orderHistoryModal.hide();

    // Очищаем таблицу перед добавлением новых данных
    detailsContent.innerHTML = '';

    // Загружаем данные о товарах в заказе
    fetch(`${getOrderElementsUrl}?orderId=${orderId}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                detailsContent.innerHTML = '<tr><td colspan="4">Нет товаров в заказе</td></tr>';
                return;
            }
            data.forEach(item => {
                const row = document.createElement('tr'); // Создаем строку таблицы
                row.innerHTML = `
                    <td>
                        <a href="${item.product_url}" class="product_url" target="_blank" style="text-decoration: none; color: inherit; text-align: left;">
                            ${item.product_name}
                        </a>
                    </td>
                    <td>${item.color}</td>
                    <td>${item.size}</td>
                    <td>${item.quantity}</td>
                `;
                detailsContent.appendChild(row); // Добавляем строку в таблицу
            });

            // Открываем второе модальное окно
            orderDetailsModal.show();
        })
        .catch(error => {
            console.error('Ошибка при загрузке деталей заказа:', error);
            detailsContent.innerHTML = '<tr><td colspan="4">Ошибка при загрузке данных</td></tr>';
        });
}

    // Загрузка активных заказов при открытии модального окна
    const modal = document.getElementById('orderHistoryModal');
    modal.addEventListener('shown.bs.modal', function () {
        loadOrders('active', activeOrdersList);
    });

    // Обработчик переключения вкладок
    const tabButtons = document.querySelectorAll('#orderTabs button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const status = button.id === 'active-tab' ? 'active' : 'completed';
            const container = status === 'active' ? activeOrdersList : completedOrdersList;
            loadOrders(status, container);
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const orderHistoryModalElement = document.getElementById('orderHistoryModal');
    const orderDetailsModalElement = document.getElementById('orderDetailsModal');
    const orderHistoryModal = new bootstrap.Modal(orderHistoryModalElement);

    // Обработчик закрытия второго модального окна
    orderDetailsModalElement.addEventListener('hidden.bs.modal', function () {
        // Открываем первое модальное окно
        orderHistoryModal.show();
    });
});
