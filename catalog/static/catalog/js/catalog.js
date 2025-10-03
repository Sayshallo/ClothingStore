document.addEventListener('DOMContentLoaded', function () {
    const productsModal = document.getElementById('productsModal');
    const productsModalLabel = document.getElementById('productsModalLabel');
    const productLists = productsModal.querySelectorAll('.product-list');
    productsModal.addEventListener('show.bs.modal', function (event) {
        const triggerElem = event.relatedTarget;
        const subcategoryId = triggerElem.getAttribute('data-subcategory-id');
        const subcategoryName = triggerElem.getAttribute('data-subcategory-name');
        // Скрыть все product-list
        productLists.forEach(pl => pl.classList.remove('active'));
        // Показать список товаров выбранной подкатегории
        const activeList = productsModal.querySelector(`#products-${subcategoryId}`);
        if (activeList) activeList.classList.add('active');
        // Обновить заголовок модального окна
        productsModalLabel.textContent = 'Товары: ' + subcategoryName;
    });
    // Логика работы плюс/минус в карточках товаров
    productsModal.querySelectorAll('.product-card').forEach(card => {
        const plusBtn = card.querySelector('.btn-plus');
        const minusBtn = card.querySelector('.btn-minus');
        const countElem = card.querySelector('.count');
        const quantityControl = card.querySelector('.quantity-control');
        plusBtn.addEventListener('click', () => {
            let count = parseInt(countElem.textContent, 10);
            count++;
            countElem.textContent = count;
            if(count > 0){
                quantityControl.classList.remove('initial');
                minusBtn.style.display = 'inline-block';
            }
        });
        minusBtn.addEventListener('click', () => {
            let count = parseInt(countElem.textContent, 10);
            if(count > 1){
                count--;
                countElem.textContent = count;
            } else {
                count = 0;
                countElem.textContent = count;
                quantityControl.classList.add('initial');
                minusBtn.style.display = 'none';
            }
        });
    });
});