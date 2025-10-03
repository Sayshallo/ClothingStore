document.addEventListener("DOMContentLoaded", () => {
    let btn = document.getElementById('change_email');
    if (!btn) return;

    let originalText = btn.textContent.trim();
    let hoverText = 'Поменять email';

    btn.addEventListener('mouseenter', () => {
        btn.style.opacity = '0';
        btn.style.transition = 'opacity 0.3s ease';
        setTimeout(() => btn.textContent = hoverText, 150);
        setTimeout(() => btn.style.opacity = '1', 160);
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.opacity = '0';
        btn.style.transition = 'opacity 0.3s ease';
        setTimeout(() => btn.textContent = originalText, 150);
        setTimeout(() => btn.style.opacity = '1', 160);
    });

    const phone_btn = document.getElementById('change_phone');
    if (!phone_btn) return;

    const phoneOriginalText = phone_btn.textContent.trim();
    const phoneHoverText = 'Поменять телефон';

    phone_btn.addEventListener('mouseenter', () => {
        phone_btn.style.opacity = '0';
        phone_btn.style.transition = 'opacity 0.3s ease';
        setTimeout(() => phone_btn.textContent = phoneHoverText, 150);
        setTimeout(() => phone_btn.style.opacity = '1', 160);
    });

    phone_btn.addEventListener('mouseleave', () => {
        phone_btn.style.opacity = '0';
        phone_btn.style.transition = 'opacity 0.3s ease';
        setTimeout(() => phone_btn.textContent = phoneOriginalText, 150);
        setTimeout(() => phone_btn.style.opacity = '1', 160);
    });


});


