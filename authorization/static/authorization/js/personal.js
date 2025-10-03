const emailTitle = document.getElementById('email_title');
const emailButton = document.getElementById('email_btn');
const emailInput = document.getElementById('newEmail');

const phoneTitle = document.getElementById('phone_title');
const phoneButton = document.getElementById('phone_btn');
const phoneInput = document.getElementById('newPhone');

let code = null;
let step = 1;
let newEmail = null;


document.addEventListener('DOMContentLoaded', function () {

    emailButton.addEventListener('click', async function () {
        if (step === 1) {
            const response = await fetch(check_url, {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrf_token.value
                    },
                    body: JSON.stringify({
                            email: document.getElementById('change_email').textContent,
                            password: emailInput.value,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showNotification("success", data.message);
                            step = 2;

                            emailButton.style.opacity = '0';
                            emailButton.style.transition = 'opacity 0.3s ease';
                            setTimeout(() => emailButton.textContent = "Отправить код", 300);
                            setTimeout(() => emailButton.style.opacity = '1', 320);

                            emailTitle.style.opacity = '0';
                            emailTitle.style.transition = 'opacity 0.3s ease';
                            setTimeout(() => emailTitle.textContent = "Введите новую почту", 300);
                            setTimeout(() => emailTitle.style.opacity = '1', 320);

                            emailInput.style.opacity = '0';
                            emailInput.type = "text";
                            emailInput.style.transition = 'opacity 0.3s ease';
                            setTimeout(() => emailInput.placeholder = "example@mail.com", 300);
                            emailInput.value = '';
                            setTimeout(() => emailInput.style.opacity = '1', 320);
                        } else {
                            showNotification("danger", data.message);
                            return;
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка:', error);
                    });
        } else if (step === 2) {
            if (isValidEmail(emailInput.value.trim())) { } else { showNotification("danger", "Ошибка: введите корректный email"); return; }

            emailButton.disabled = true;
            emailButton.style.opacity = '0.5';

            fetch(code_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf_token.value
                },
                body: JSON.stringify({ email: emailInput.value })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    newEmail = emailInput.value;
                    code = data.code;
                    showNotification("success", "Код отправлен на указанную почту");
                    step = 3;

                    emailButton.style.opacity = '0';
                    emailButton.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => emailButton.textContent = "Проверить", 300);
                    setTimeout(() => emailButton.style.opacity = '1', 320);

                    emailTitle.style.opacity = '0';
                    emailTitle.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => emailTitle.textContent = "Введите код подтверждения", 300);
                    setTimeout(() => emailTitle.style.opacity = '1', 320);

                    emailInput.style.opacity = '0';
                    emailInput.type = "text";
                    emailInput.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => emailInput.placeholder = "", 300);
                    setTimeout(() => emailInput.value = '', 300);
                    setTimeout(() => emailInput.style.opacity = '1', 320);

                    emailButton.disabled = false;
                    emailButton.style.opacity = '1';
                } else {
                    showNotification("danger", data.message);

                    emailButton.disabled = false;
                    emailButton.style.opacity = '1';
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        } else {
            if (code === emailInput.value.trim()) {
                fetch(update_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrf_token.value
                    },
                    body: JSON.stringify({
                        email: document.getElementById('change_email').textContent,
                        new_email: newEmail
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        emailButton.disabled = true;
                        showNotification("success", data.message);
                        document.getElementById('change_email').textContent = `${newEmail}`;
                        originalText = `${newEmail}`;

                        setTimeout(() => { showNotification("success", "Сейчас страница обновится"); }, 1500);
                        setTimeout(() => { window.location.reload(); }, 4000);
                    } else { showNotification("danger", data.message); return }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                });
            }
            else { showNotification("danger", "Неверный код"); return; }
        }
    });

    // --------------------------     Смена телефона     -----------------------------------

    phoneButton.addEventListener('click', async function () {
        if (phoneButton.textContent === "Проверить") {
            const response = await fetch(check_url, {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrf_token.value
                    },
                    body: JSON.stringify({
                            email: document.getElementById('change_email').textContent.trim(),
                            password: phoneInput.value,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showNotification("success", data.message);

                            phoneButton.style.opacity = '0';
                            phoneButton.style.transition = 'opacity 0.3s ease';
                            setTimeout(() => phoneButton.textContent = "Поменять", 300);
                            setTimeout(() => phoneButton.style.opacity = '1', 320);

                            phoneTitle.style.opacity = '0';
                            phoneTitle.style.transition = 'opacity 0.3s ease';
                            setTimeout(() => phoneTitle.textContent = "Введите новый номер телефона", 300);
                            setTimeout(() => phoneTitle.style.opacity = '1', 320);

                            phoneInput.style.opacity = '0';
                            phoneInput.type = "text";
                            phoneInput.maxLength = 16;
                            phoneInput.style.transition = 'opacity 0.3s ease';
                            setTimeout(() => phoneInput.placeholder = "+7(___)___-__-__", 300);
                            phoneInput.value = '';
                            setTimeout(() => phoneInput.style.opacity = '1', 320);

                            document.getElementById('newPhone').onkeydown = function(e){
                                inputphone(e,document.getElementById('newPhone'))
                            }

                            function inputphone(e, phone){
                                function stop(evt) {
                                    evt.preventDefault();
                                }
                                let key = e.key, v = phone.value; not = key.replace(/([0-9])/, 1)

                                if(not == 1 || 'Backspace' === not){
                                if('Backspace' != not){
                                    if(v.length < 3 || v ===''){phone.value= '+7('}
                                    if(v.length === 6){phone.value= v +')'}
                                    if(v.length === 10){phone.value= v +'-'}
                                     if(v.length === 13){phone.value= v +'-'}
                                    }
                                }else{stop(e)}  }
                        } else {
                            showNotification("danger", data.message);
                            return;
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка:', error);
                    });
        } else {
                fetch(update_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrf_token.value
                    },
                    body: JSON.stringify({
                        phone: document.getElementById('change_phone').textContent.trim(),
                        new_phone: phoneInput.value
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        emailButton.disabled = true;
                        showNotification("success", data.message);

                        document.getElementById('change_phone').textContent = `${phoneInput.value}`;
                        setTimeout(() => { showNotification("success", "Сейчас страница обновится"); }, 1500);
                        setTimeout(() => { window.location.reload(); }, 4000);
                    } else { showNotification("danger", data.message); return; }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                });
        }
    });



    document.getElementById('change_password').addEventListener('click', function () {
        const oldPassword = document.getElementById('oldPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!oldPassword || !newPassword || !confirmPassword) { showNotification("danger", "Заполните все поля"); return; }

        if (newPassword !== confirmPassword) { showNotification("danger", "Новые пароли не совпадают"); return; }

        if (newPassword.length < 8) { showNotification("danger", "Новый пароль должен содержать минимум 8 символов"); return; }

        fetch(check_url, {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrf_token.value
                    },
                    body: JSON.stringify({
                            email: document.getElementById('change_email').textContent.trim(),
                            password: oldPassword,
                        })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification("success", data.message);
            } else {
                showNotification("danger", data.message);
                return;
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });



        fetch(update_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token.value
            },
            body: JSON.stringify({
                email: document.getElementById('change_email').textContent.trim(),
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                emailButton.disabled = true;
                showNotification("success", data.message);

                document.getElementById('change_phone').textContent = `${phoneInput.value}`;
                setTimeout(() => { showNotification("success", "Сейчас страница обновится"); }, 1500);
                setTimeout(() => { window.location.reload(); }, 4000);
            } else { showNotification("danger", data.message); return; }
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

    function isValidEmail(email) {
            const EMAIL_REGEXP = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,4}$/i;
            return EMAIL_REGEXP.test(email);
        }

    $(document).ready(function(){
        $("#changeEmail").on('hide.bs.modal', function () {
           step = 1;

           emailButton.style.opacity = '0';
           emailButton.style.transition = 'opacity 0.3s ease';
           setTimeout(() => emailButton.textContent = "Проверить", 300);
           setTimeout(() => emailButton.style.opacity = '1', 320);

           emailTitle.style.opacity = '0';
           emailTitle.style.transition = 'opacity 0.3s ease';
           setTimeout(() => emailTitle.textContent = "Введите пароль", 300);
           setTimeout(() => emailTitle.style.opacity = '1', 320);

           emailInput.style.opacity = '0';
           emailInput.type = "password";
           emailInput.style.transition = 'opacity 0.3s ease';
           setTimeout(() => emailInput.placeholder = "", 300);
           setTimeout(() => emailInput.value = '', 300);
           setTimeout(() => emailInput.style.opacity = '1', 320);
        });

    });

    $(document).ready(function(){
        $("#changePhone").on('hide.bs.modal', function () {
            document.getElementById('newPhone').onkeydown = null;
            phoneInput.maxLength = 50;

           phoneButton.style.opacity = '0';
           phoneButton.style.transition = 'opacity 0.3s ease';
           setTimeout(() => phoneButton.textContent = "Проверить", 300);
           setTimeout(() => phoneButton.style.opacity = '1', 320);

           phoneTitle.style.opacity = '0';
           phoneTitle.style.transition = 'opacity 0.3s ease';
           setTimeout(() => phoneTitle.textContent = "Введите пароль", 300);
           setTimeout(() => phoneTitle.style.opacity = '1', 320);

           phoneInput.style.opacity = '0';
           phoneInput.type = "password";
           phoneInput.style.transition = 'opacity 0.3s ease';
           setTimeout(() => phoneInput.placeholder = "", 300);
           setTimeout(() => phoneInput.value = '', 300);
           setTimeout(() => phoneInput.style.opacity = '1', 320);
        });

    });

    $(document).ready(function(){
        $("#changePassword").on('hide.bs.modal', function () {
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        });

    });