        const popup = document.getElementById('popup');
        const popupOverlay = document.getElementById('popupOverlay');
        const otherRecipientRadio = document.getElementById('other');

        otherRecipientRadio.addEventListener('change', () => {
            if (otherRecipientRadio.checked) {
                popup.style.display = 'block';
                popupOverlay.style.display = 'block';
            } else {
                popup.style.display = 'none';
                popupOverlay.style.display = 'none';
            }
        });

        popupOverlay.addEventListener('click', () => {
            popup.style.display = 'none';
            popupOverlay.style.display = 'none';
            otherRecipientRadio.checked = false; // Сбрасываем выбор "Другой"
        });

        // Обработка формы Pop-up
        const recipientForm = document.getElementById('recipientForm');
        recipientForm.addEventListener('submit', (event) => {
            event.preventDefault();
            showNotification("success", 'Данные получателя сохранены!');
            popup.style.display = 'none';
            popupOverlay.style.display = 'none';
        });


document.addEventListener('DOMContentLoaded', () => {
    const paymentMethod = document.getElementById('paymentMethod');
    const cardPayment = document.getElementById('cardPayment');
    const selectedCard = document.getElementById('selectedCard');
    const cardList = document.getElementById('cardList');
    const addCardButton = document.getElementById('addCardButton');
    const newCardPopup = document.getElementById('newCardPopup');
    const newCardPopupOverlay = document.getElementById('newCardPopupOverlay');
    const newCardForm = document.getElementById('newCardForm');

    // Показать/скрыть блок оплаты картой
    paymentMethod.addEventListener('change', () => {
        if (paymentMethod.value === 'card') {
            cardPayment.style.display = 'block';
        } else {
            cardPayment.style.display = 'none';
        }
    });

    // Выбор карты из списка
    cardList.addEventListener('click', (event) => {
        if (event.target.classList.contains('dropdown-item')) {
            selectedCard.value = event.target.dataset.number;
        }
    });

    // Открытие Pop-up для добавления новой карты
    addCardButton.addEventListener('click', () => {
        newCardPopup.style.display = 'block';
        newCardPopupOverlay.style.display = 'block';
    });

    // Закрытие Pop-up при клике на фон
    newCardPopupOverlay.addEventListener('click', () => {
        newCardPopup.style.display = 'none';
        newCardPopupOverlay.style.display = 'none';
    });

    // Форматирование номера карты
    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', () => {
        let value = cardNumber.value.replace(/\D/g, ''); // Удаляем все нецифры
        value = value.match(/.{1,4}/g)?.join(' ') || ''; // Разделяем по 4 цифры
        cardNumber.value = value;
    });

    // Форматирование даты истечения
    const cardDate = document.getElementById('cardDate');
    cardDate.addEventListener('input', () => {
        let value = cardDate.value.replace(/\D/g, ''); // Удаляем все нецифры
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4); // Разделяем MM/YY
        }
        cardDate.value = value;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const selectedCardInput = document.getElementById('selectedCard');
    const cvvInput = document.getElementById('cvvInput');

    // Обработчик выбора карты из списка
    document.querySelectorAll('#cardList .dropdown-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const cardNumber = this.getAttribute('data-number');
            selectedCardInput.value = cardNumber;

            // Включаем поле CVV после выбора карты
            cvvInput.disabled = false;
            cvvInput.setCustomValidity(''); // Снимаем ошибку
            cvvInput.classList.remove('is-invalid');
        });
    });

    // Обработчик фокуса на поле CVV
    cvvInput.addEventListener('focus', function () {
        if (!selectedCardInput.value.trim()) {
            // Если карта не выбрана, показываем ошибку и блокируем поле
            cvvInput.disabled = true;
            cvvInput.setCustomValidity('Пожалуйста, выберите карту перед вводом CVV.');
            cvvInput.classList.add('is-invalid');
        }
    });

    // Обработчик отправки формы (если есть)
    document.querySelector('form')?.addEventListener('submit', function (e) {
        if (!selectedCardInput.value.trim()) {
            cvvInput.disabled = true;
            cvvInput.setCustomValidity('Пожалуйста, выберите карту перед вводом CVV.');
            cvvInput.classList.add('is-invalid');
            e.preventDefault(); // Предотвращаем отправку формы
        }
    });
});