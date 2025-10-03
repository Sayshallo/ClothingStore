// Non Binary
document.addEventListener('DOMContentLoaded', function () {
    const sizeOptions = document.querySelectorAll('.size-option input[type="radio"]');
    const colorOptions = document.querySelectorAll('.color-option input[type="radio"]');
    const countElement = document.querySelector('.count');
    const selectedSizeInput = document.getElementById('cart-selected-size');
    const selectedColorInput = document.getElementById('cart-selected-color');
    const firstSize = document.querySelector('.sizes input[type="radio"]');
    const firstColor = document.querySelector('.colors input[type="radio"]');
    const btnPlus = document.querySelector('.btn-plus');
    const btnMinus = document.querySelector('.btn-minus');
    const selectedPlusColorInput = document.getElementById('plus-selected-color');
    const selectedPlusSizeInput = document.getElementById('plus-selected-size');
    let isLocked = false;
    let count = 0;

    if (firstSize) {
        firstSize.checked = true; // Делаем первый размер активным
        selectedSizeInput.value = firstSize.value; // Заполняем скрытое поле размера
    }

    if (firstColor) {
        firstColor.checked = true; // Делаем первый цвет активным
        selectedColorInput.value = firstColor.value; // Заполняем скрытое поле цвета
    }

    // Логика для выбора размера
    sizeOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (!isLocked) {
                selectedSizeInput.value = option.value;
            }
        });
    });

    // Логика для выбора цвета
    colorOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (!isLocked) {
                selectedColorInput.value = option.value;
            }
        });
    });

    // Логика для кнопки "+"
    btnPlus.addEventListener('click', async () => {
        count = countElement.textContent;

        if (count == 1) { updateRadioButtonsState(); }
    });

    // Логика для кнопки "+"
    btnMinus.addEventListener('click', async () => {
        count = countElement.textContent;

        if (count == 0) { updateRadioButtonsState(); }
    });

    function updateRadioButtonsState() {
        isLocked = !isLocked;
        sizeOptions.forEach(option => {
            option.disabled = isLocked;
        });
        colorOptions.forEach(option => {
            option.disabled = isLocked;
        });
    }

});
