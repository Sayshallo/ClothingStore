import json

from .models import Users  # Импортируем вашу модель
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
from django.shortcuts import render, redirect
from .models import Categories
from catalog.models import ViewHistory

def authorization_view(request):
    return render(request, 'authorization/auth.html')

def lk_view(request):

    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')

    try:
        user = Users.objects.get(id=user_id)
    except Users.DoesNotExist:
        return redirect('login')

    context = {
        'categories': Categories.objects.all(),
        'user': user,
        'view_history': ViewHistory.objects.filter(user_id=user_id).select_related('product').order_by('-viewed_at'),
    }

    # Передаем данные пользователя в шаблон
    return render(request, 'authorization/lk.html', context)

# Дополненный метод login_view
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        code = data.get('emailCode')

        try:
            user = Users.objects.get(email=email)

            if (code == request.session['auth_code']):
                pass
            else:
                return render(request, 'authorization/auth.html', {'login_error': True})

            # Проверяем пароль с помощью check_password
            if check_password(password, user.password_hash):

                # Авторизуем пользователя после подтверждения кода
                request.session['user_id'] = user.id

                user_id = user.id
                # Получаем историю просмотров пользователя (последние 12 записей)
                view_history = ViewHistory.objects.filter(user_id=user_id).select_related('product').order_by(
                    '-viewed_at')
                return render(request, 'authorization/lk.html', {
                    'categories': Categories.objects.all(),
                    'user': user,
                    'login_success': 'Вы успешно вошли!',
                    'view_history': view_history,
                })
            else:
                return render(request, 'authorization/auth.html', {'login_error': True})
        except Users.DoesNotExist:
            return render(request, 'authorization/auth.html', {'login_error': True})

    return render(request, 'authorization/auth.html')


# Дополненный метод register_view
def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('registerName')
        email = request.POST.get('registerEmail')
        phone = request.POST.get('registerPhone')
        password = request.POST.get('registerPassword')

        # Проверяем уникальность данных
        if Users.objects.filter(username=username).exists():
            return render(request, 'authorization/auth.html',
                          {'register_error': 'Пользователь с таким именем уже существует.'})
        if Users.objects.filter(email=email).exists():
            return render(request, 'authorization/auth.html',
                          {'register_error': 'Пользователь с таким email уже существует.'})
        if Users.objects.filter(phone=phone).exists():
            return render(request, 'authorization/auth.html',
                          {'register_error': 'Пользователь с таким телефоном уже существует.'})

        # Создаем пользователя
        hashed_password = make_password(password)
        user = Users.objects.create(
            username=username,
            email=email,
            phone=phone,
            password_hash=hashed_password
        )


        # Авторизуем пользователя
        request.session['user_id'] = user.id

        user_id = user.id
        # Получаем историю просмотров пользователя (последние 12 записей)
        view_history = ViewHistory.objects.filter(user_id=user_id).select_related('product').order_by(
            '-viewed_at')
        # Перенаправляем в ЛК с уведомлением
        return render(request, 'authorization/lk.html', {
            'categories': Categories.objects.all(),
            'user': user,
            'register_success': 'Вы успешно зарегистрировались!',
            'view_history': view_history,
        })

    return render(request, 'authorization/auth.html')

def logout_view(request):
    if 'user_id' in request.session:
        del request.session['user_id']  # Удаляем ID пользователя из сессии
    return redirect('authorization')  # Перенаправляем на страницу авторизации

def delete_account_view(request):
    user_id = request.session.get('user_id')  # Получаем ID пользователя из сессии
    if user_id:
        try:
            user = Users.objects.get(id=user_id)
            user.delete()  # Удаляем пользователя из базы данных
            if 'user_id' in request.session:
                del request.session['user_id']  # Удаляем ID пользователя из сессии
        except Users.DoesNotExist:
            pass
    return redirect('authorization')  # Перенаправляем на страницу авторизации