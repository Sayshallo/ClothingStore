const csrfTokenInput = document.querySelector('[name="csrfmiddlewaretoken"]');
        const verifyCodeButton = document.getElementById('verifyCodeButton');
        const verificationCodeInput = document.getElementById('verificationCodeInput');
        let authCode = null;

        const loginBtn = document.getElementById('login_enter');
        const registerBtn = document.getElementById('register_enter');
        const forgotBtn = document.getElementById('forgot_password');

        registerName = document.getElementById('registerName');
        registerEmail = document.getElementById('registerEmail');
        registerPhone = document.getElementById('registerPhone');
        registerPassword = document.getElementById('registerPassword');

        loginPassword = document.getElementById('loginPassword');
        loginEmail = document.getElementById('loginEmail');

        let currentButtonText = null;

        // ----------------------------------------------        Попытка входа         -----------------------------------------------------------
        document.addEventListener('DOMContentLoaded', function () {

            forgotBtn.addEventListener('click', async function () {
                currentButtonText = forgotBtn.textContent || forgotBtn.innerText;

                if (loginEmail.value === '') { showNotification("danger", "Введите почту для восстановления пароля"); return; }
                const modal = new bootstrap.Modal(document.getElementById('verificationModal'));
                modal.show();

                fetch(code_url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfTokenInput.value
                            },
                            body: JSON.stringify({ email: loginEmail.value })
                        })
                        .then(response => response.json())
                        .then(data => {
                            authCode = data.code;
                        })
                        .catch(error => {
                            console.error('Ошибка:', error);
                        });
            });

            loginBtn.addEventListener('click', async function () {
                currentButtonText = loginBtn.textContent || loginBtn.innerText;

                 try {
                    // Отправляем данные на сервер через fetch
                    const response = await fetch(login_url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfTokenInput.value
                        },
                        body: JSON.stringify({
                            email: loginEmail.value,
                            password: loginPassword.value
                        })
                    });

                    const data = await response.json();
                    let login_message = data.message;

                    if (data.success) {
                        const modal = new bootstrap.Modal(document.getElementById('verificationModal'));
                        modal.show();


                        fetch(code_url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfTokenInput.value
                            },
                            body: JSON.stringify({ email: loginEmail.value })
                        })
                        .then(response => response.json())
                        .then(data => {
                            authCode = data.code;
                        })
                        .catch(error => {
                            console.error('Ошибка:', error);
                        });
                    } else {
                        showNotification("danger",login_message);
                    }
                } catch (error) {
                    console.error('Ошибка при отправке данных:', error);
                    showNotification("danger",'Произошла ошибка при попытке входа');
                }

            });

            // ------------------------------  Проверка кода  -----------------------------------
            const emailCode = verificationCodeInput.value;
            // Добавляем обработчик события на кнопку "Проверить"
            verifyCodeButton.addEventListener('click', async function () {

                // Проверяем, что код введен
                if (!verificationCodeInput.value || verificationCodeInput.value.length !== 4) {
                    showNotification("danger",'Пожалуйста, введите 4-значный код.');
                    return;
                }

                let bodyContent = null;
                if (currentButtonText === 'Войти') {
                    bodyContent = JSON.stringify({ email: loginEmail.value })
                }
                else if (currentButtonText === 'Зарегистрироваться') {
                    bodyContent = JSON.stringify({
                        name: registerName.value,
                        email: registerEmail.value,
                        phone: registerPhone.value,
                        password: registerPassword.value,
                    })
                }
                else {
                    bodyContent = JSON.stringify({
                        email: loginEmail.value,
                        remake_password: true
                    })
                }

                if (authCode === verificationCodeInput.value) {
                    verifyCodeButton.disabled = true;
                        fetch(save_url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfTokenInput.value
                            },
                            body: bodyContent
                        })
                        .then(response => response.json())
                        .then(data => {
                            let auth_message = data.auth_message;
                            showNotification("success", auth_message);
                            if (data.success) {
                                setTimeout(() => {
                                    window.location.href = lk_url;
                                }, 2000);
                            } else {
                                setTimeout(() => {
                                    showNotification("success", "Сейчас страница обновится. Постарайтесь войти снова");
                                }, 1500);
                                setTimeout(() => {
                                    window.location.href = lk_url;
                                }, 5000);
                            }
                        })
                        .catch(error => {
                            console.error('Ошибка:', error);
                        });
                }
                else {
                    showNotification("danger",'Неверный код');
                }

            });

            registerBtn.addEventListener('click', async function () {
                currentButtonText = registerBtn.textContent || registerBtn.innerText;

                if (registerName.value === '' || registerEmail.value === '' || registerPhone.value === '' || registerPassword.value === '') {
                    showNotification("danger", "Не все поля заполнены.");
                    return;
                }

                const modal = new bootstrap.Modal(document.getElementById('verificationModal'));
                modal.show();

                fetch(code_url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfTokenInput.value
                            },
                            body: JSON.stringify({ email: registerEmail.value })
                        })
                        .then(response => response.json())
                        .then(data => {
                            authCode = data.code;
                        })
                        .catch(error => {
                            console.error('Ошибка:', error);
                        });
            });
        });

        function showNotification(type, message) {
            const notificationContainer = document.getElementById('notification-container');
            const notification = document.createElement('div');
            notification.className = `alert alert-${type} alert-dismissible fade-in`;
            notification.role = 'alert';
            notification.innerHTML = `
                ${message}
            `;
            notificationContainer.appendChild(notification);

            // Удаляем уведомление через 3 секунды
            setTimeout(() => {
                notification.classList.remove('fade-in'); // Убираем класс для запуска исчезновения
                notification.classList.add('fade-out'); // Добавляем класс для анимации исчезновения

                // Удаляем элемент после завершения анимации
                notification.addEventListener('animationend', () => {
                    notification.remove();
                });
            }, 3000); // 3 секунды
        }