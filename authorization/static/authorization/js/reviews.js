document.addEventListener('DOMContentLoaded', function () {

    // Функция для загрузки отзывов
    function loadReviews(categoryId, container) {
        fetch(`${getReviewsUrl}`)
            .then(response => response.json())
            .then(data => {
                container.innerHTML = ''; // Очищаем контейнер

                const reviews = data[categoryId];

                if (!reviews) {
                    container.innerHTML = '<p style="margin-top: 30px;">Нет отзывов в этой категории</p>';
                    return;
                }

                reviews.forEach(review => {
                    const card = document.createElement('div');
                    card.className = 'review-card';
                    const product_id = "product-" + review.product_id;

                    card.innerHTML = `
                        <div class="header">
                            <h5 class="review_product_id"  id="${product_id}">
                                ${review.product_name}
                            </h5>
                            <h2 class="stars">${'★'.repeat(review.stars)}</h2>
                        </div>
                        <div class="description">${review.description}</div>
                    `;

                    container.appendChild(card);

                    document.getElementById(product_id).addEventListener('click', function () {
                        window.location.href = review.product_url; // Перенаправляем на страницу товара
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка при загрузке отзывов:', error);
                container.innerHTML = '<p>Ошибка при загрузке данных</p>';
            });
    }

    // Обработчик переключения вкладок
    const tabButtons = document.querySelectorAll('#reviewTabs button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const categoryId = button.getAttribute('data-bs-target').replace('#category-', '');
            const container = document.querySelector(`#category-${categoryId} .review-list`);

            loadReviews(categoryId, container);
        });
    });

    // Загрузка отзывов при открытии модального окна
    const modal = document.getElementById('reviewsModal');
    modal.addEventListener('shown.bs.modal', function () {
        const firstTabButton = document.querySelector('#reviewTabs button.active');
        const categoryId = firstTabButton.getAttribute('data-bs-target').replace('#category-', '');
        const container = document.querySelector(`#category-${categoryId} .review-list`);

        loadReviews(categoryId, container);
    });
});