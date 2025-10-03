document.addEventListener('DOMContentLoaded', function () {
    // Загрузка данных при открытии модального окна
    const modal = document.getElementById('viewCreditCards');
    modal.addEventListener('shown.bs.modal', function () {
        loadCreditCards();
    });
});

// Форматирование номера карты
        let cardNumber = document.getElementById('cardNumber');
        cardNumber.addEventListener('input', () => {
            let value = cardNumber.value.replace(/\D/g, ''); // Удаляем все нецифры
            value = value.match(/.{1,4}/g)?.join(' ') || ''; // Разделяем по 4 цифры
            cardNumber.value = value;
        });

        // Форматирование даты истечения
        let cardDate = document.getElementById('cardDate');
        cardDate.addEventListener('input', () => {
            let value = cardDate.value.replace(/\D/g, ''); // Удаляем все нецифры
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4); // Разделяем MM/YY
            }
            cardDate.value = value;
        });

document.addEventListener('DOMContentLoaded', function () {
    const addCardForm = document.getElementById('newCardForm');

    // Обработчик отправки формы
    addCardForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Предотвращаем стандартную отправку формы

        cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, ''); // Убираем пробелы
        cardDate = document.getElementById('cardDate').value;
        const cardCVV = document.getElementById('cardCVV').value;

        // Проверяем валидность данных
        if (!/^\d{16}$/.test(cardNumber)) {
            alert('Номер карты должен содержать 16 цифр.');
            return;
        }
        if (!/^\d{2}\/\d{2}$/.test(cardDate)) {
            alert('Дата истечения должна быть в формате MM/YY.');
            return;
        }
        if (!/^\d{3}$/.test(cardCVV)) {
            alert('CVV должен содержать 3 цифры.');
            return;
        }

        // Отправляем данные на сервер
        fetch(addCardUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': `${csrf_token}`
            },
            body: JSON.stringify({
                card_number: cardNumber,
                expiry_date: cardDate,
                cvv: cardCVV
            })
        })
        .then(response => {
            if (response.ok) {
                alert('Карта успешно добавлена.');
                const addCardModal = bootstrap.Modal.getInstance(document.getElementById('addCreditCardModal'));
                addCardModal.hide(); // Закрываем модальное окно
                loadCreditCards(); // Обновляем список карт
            } else {
                alert('Ошибка при добавлении карты.');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при добавлении карты.');
        });
    });
});


// Функция для загрузки данных о картах
    function loadCreditCards() {
        fetch(getCreditCardsUrl)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('credit-cards-list');
                container.innerHTML = ''; // Очищаем контейнер

                if (data.length === 0) {
                    container.innerHTML = '<p>Нет сохраненных карт.</p>';
                    return;
                }

                data.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card-item';
                    cardElement.innerHTML = `
                        <span>•••• ${card.last_digits}</span>
                        <span style="margin-left: auto;">${card.expiration_date}</span>
                        <button class="btn btn-danger btn-sm delete-card" data-card-id="${card.id}" style="margin-left: 10px;">
                            Удалить
                        </button>
                    `;
                    container.appendChild(cardElement);
                });

                // Добавляем обработчики для кнопок "Удалить"
                addDeleteCardHandlers();
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных:', error);
                document.getElementById('credit-cards-list').innerHTML = '<p>Ошибка при загрузке данных.</p>';
            });
    }

    // Функция для добавления обработчиков кнопок "Удалить"
    function addDeleteCardHandlers() {
        const deleteButtons = document.querySelectorAll('.delete-card');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const cardId = this.getAttribute('data-card-id');

                // Получаем экземпляры модальных окон
                const viewCreditCardsModal = bootstrap.Modal.getInstance(document.getElementById('viewCreditCards'));
                const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));

                // Скрываем модальное окно с просмотром карт
                viewCreditCardsModal.hide();

                // Открываем модальное окно подтверждения
                confirmDeleteModal.show();

                // Обработчик для кнопки "Удалить" в модальном окне
                const confirmDeleteButton = document.getElementById('confirmDeleteButton');
                confirmDeleteButton.onclick = function () {
                    deleteCreditCard(cardId); // Удаляем карту
                    confirmDeleteModal.hide(); // Закрываем модальное окно подтверждения
                    viewCreditCardsModal.show(); // Возвращаем модальное окно с просмотром карт
                };

                // Обработчик закрытия модального окна подтверждения
                const confirmDeleteModalElement = document.getElementById('confirmDeleteModal');
                confirmDeleteModalElement.addEventListener('hidden.bs.modal', function () {
                    viewCreditCardsModal.show(); // Возвращаем модальное окно с просмотром карт
                });
            });
        });
    }

    // Функция для удаления карты
    function deleteCreditCard(cardId) {
        fetch(`delete_card/${cardId}/`, { method: 'DELETE' }) // URL для удаления карты
            .then(response => {
                if (response.ok) {
                    loadCreditCards(); // Обновляем список карт
                } else {
                    alert('Ошибка при удалении карты.');
                }
            })
            .catch(error => {
                console.error('Ошибка при удалении карты:', error);
                alert('Ошибка при удалении карты.');
            });
    }
