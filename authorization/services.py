import json
import secrets
import string

from django.contrib.auth.hashers import check_password, make_password
from django.http import JsonResponse
import requests
from django.views.decorators.csrf import csrf_exempt
from authorization.models import Reviews, Users
from cart.models import CreditCard
from catalog.models import Orders, OrderItems
from main.models import Products
import random
from django.core.mail import send_mail
from django.conf import settings

def get_orders(request):
    status = request.GET.get('status', 'active')
    user_id = request.session.get('user_id')

    if not user_id:
        return JsonResponse({'error': 'Пользователь не авторизован.'}, status=401)

    # Получаем активные или завершенные заказы
    if status == 'active':
        orders = Orders.objects.filter(user_id=user_id, status__in=['Ожидает оплаты', 'Ожидает получения'])
    else:
        orders = Orders.objects.filter(user_id=user_id, status='Получен')

    # Формируем данные для отправки
    data = [
        {
            'id': order.id,
            'status': order.status,
            'order_date': order.order_date.isoformat(),
            'total_price': float(order.total_price)
        }
        for order in orders
    ]

    return JsonResponse(data, safe=False)

def get_order_details(request):
    order_id = request.GET.get('orderId', '1')  # Получаем ID заказа из запроса
    items = OrderItems.objects.filter(order_id=order_id).values(
        'product_id', 'quantity', 'size', 'color'
    )

    data = []
    for item in items:
        product = Products.objects.filter(id=item['product_id']).first()
        if product:
            subcategory_name = product.subcategory.name if product.subcategory else 'unknown'
            product_url = f"http://{request.get_host()}/catalog/{subcategory_name}/products/{product.id}/"

            data.append({
                'product_name': product.name,
                'quantity': item['quantity'],
                'size': item['size'],
                'color': item['color'],
                'price': float(product.price),
                'product_url': product_url
            })

    return JsonResponse(data, safe=False)

def get_reviews(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return JsonResponse({'error': 'Пользователь не авторизован.'}, status=401)

    # Получаем отзывы пользователя
    reviews = Reviews.objects.filter(user_id=user_id).select_related('product', 'product__subcategory', 'product__subcategory__category')

    # Формируем данные для отправки
    data = {}
    for review in reviews:
        category_id = review.product.subcategory.category.id
        if category_id not in data:
            data[category_id] = []

        if (review.stars != None) and (review.description != ''):
            data[category_id].append({
                'product_id': review.product.id,
                'product_name': review.product.name,
                'stars': review.stars,
                'description': review.description,
                'product_url': f'/catalog/{review.product.subcategory.name}/products/{review.product.id}/'
            })

    return JsonResponse(data, safe=False)

def get_credit_cards(request):
    user_id = request.session.get('user_id')

    if not user_id:
        return JsonResponse({'error': 'Пользователь не авторизован.'}, status=401)

    # Получаем все карты пользователя
    cards = CreditCard.objects.filter(user_id=user_id).values('id', 'number', 'date')

    # Формируем данные для отправки
    data = [
        {
            'id': card['id'],
            'last_digits': card['number'][-4:],
            'expiration_date': f"{card['date'][:2]}/{card['date'][2:]}"
        }
        for card in cards
    ]

    return JsonResponse(data, safe=False)

# Тестовая функция для получения данных о карте
def get_card_info(card_number):
    # Берём первые 6 цифр (BIN-код)
    bin_code = card_number[:6]

    # Используем API CardBin для получения данных
    url = f"https://cardbin.org/{bin_code}"

    try:
        response = requests.get(url)

        if response.status_code != 200:
            return {"error": "Не удалось получить данные о карте."}

        data = response.json()

        # Формируем результат
        card_info = {
            "card_number": card_number,
            "scheme": data.get("brand", "Неизвестная платёжная система"),
            "type": data.get("type", "Неизвестный тип карты"),
            "bank": data.get("bank", "Неизвестный банк"),
            "country": data.get("country", "Неизвестная страна"),
            "currency": data.get("currency", "Неизвестная валюта"),
        }

        return card_info

    except Exception as e:
        return {"error": f"Произошла ошибка: {str(e)}"}

@csrf_exempt
def delete_card(request, card_id):
    user_id = request.session.get('user_id')

    if not user_id:
        return JsonResponse({'error': 'Пользователь не авторизован.'}, status=401)

    if request.method == 'DELETE':
        try:
            # Проверяем, принадлежит ли карта текущему пользователю
            card = CreditCard.objects.filter(user_id=user_id, id=card_id).first()

            if not card:
                return JsonResponse({'error': 'Карта не найдена или не принадлежит пользователю.'}, status=404)

            # Удаляем карту
            card.delete()

            return JsonResponse({'success': 'Карта успешно удалена.'}, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Ошибка при удалении карты: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Метод запроса не поддерживается.'}, status=405)

@csrf_exempt
def add_card(request):
    if request.method == 'POST':
        try:
            user_id = request.session.get('user_id')
            if not user_id:
                return JsonResponse({'error': 'Пользователь не авторизован.'}, status=401)

            data = json.loads(request.body)
            card_number = data.get('card_number')
            expiry_date = f"{data.get('expiry_date')}".replace('/', '')
            cvv = data.get('cvv')

            # Проверка данных
            if not card_number or not expiry_date or not cvv:
                return JsonResponse({'error': 'Все поля обязательны.'}, status=400)


            # Сохранение карты в базе данных
            CreditCard.objects.create(
                user_id=user_id,
                number=card_number,
                date=expiry_date,
                cvv=cvv
            )

            return JsonResponse({'success': 'Карта успешно добавлена.'}, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Ошибка при добавлении карты: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Метод запроса не поддерживается.'}, status=405)


@csrf_exempt
def update_data(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        new_email = data.get('new_email')
        phone = data.get('phone')
        new_phone = data.get('new_phone')
        new_password = data.get('new_password')

        try:
            if email and new_email:
                Users.objects.filter(email=email).update(email=new_email)
                return JsonResponse({'success': True, 'message': 'Почта успешно заменена!'})
            if phone and new_phone:
                Users.objects.filter(phone=phone).update(phone=new_phone)
                return JsonResponse({'success': True, 'message': 'Телефон успешно заменен!'})
            if email and new_password:
                print(email, new_password)
                Users.objects.filter(email=email).update(password_hash=make_password(new_password))
                return JsonResponse({'success': True, 'message': 'Пароль успешно заменен!'})
        except Exception as e:
            print(f"Ошибка при отправке кода: {e}")
            return JsonResponse({'success': False, 'message': 'Произошла ошибка при смене почты'})

    return JsonResponse({'success': False, 'message': 'Неверный метод запроса.'})

@csrf_exempt
def save_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        phone = data.get('phone')
        name = data.get('name')
        password = data.get('password')
        remake_password = data.get('remake_password')

        try:
            print(remake_password)
            if (remake_password):
                characters = string.ascii_letters + string.digits
                new_password = "".join(secrets.choice(characters) for i in range(8))

                send_new_password(email, new_password)

                hashed_password = make_password(new_password)
                Users.objects.filter(email=email).update(password_hash=hashed_password)

                return JsonResponse({
                    'success': False,
                    'auth_message': 'Новый пароль направлен на вашу почту!'
                })

            if not (phone and name and password):
                user = Users.objects.get(email=email)
                request.session['user_id'] = user.id

                return JsonResponse({
                    'success': True,
                    'auth_message': 'Вы успешно вошли!'
                })
            else:
                if Users.objects.filter(email=email).exists():
                    return JsonResponse({'success': False, 'auth_message': 'Пользователь с таким email уже существует'})
                if Users.objects.filter(phone=phone).exists():
                    return JsonResponse({'success': False, 'auth_message': 'Пользователь с таким телефоном уже существует'})

                # Создаем пользователя
                hashed_password = make_password(password)
                user = Users.objects.create(
                    username=name,
                    email=email,
                    phone=phone,
                    password_hash=hashed_password
                )

                request.session['user_id'] = user.id

                return JsonResponse({
                    'success': True,
                    'auth_message': 'Вы успешно зарегистрировались!'
                })
        except Exception as e:
            print(f"Ошибка при отправке кода: {e}")
            return JsonResponse({'success': False, 'auth_message': 'Пользователь отсутсвует...'})

    # Если запрос не POST, возвращаем ошибку
    return JsonResponse({'success': False, 'user': 'Неверный метод запроса.'})

def add_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = Users.objects.get(email=email)
            request.session['user_id'] = user.id

            return JsonResponse({
                'success': True,
                'user': 'вошел'
            })
        except Exception as e:
            print(f"Ошибка при отправке кода: {e}")
            return JsonResponse({'success': False, 'user': 'отсутствует'})

    # Если запрос не POST, возвращаем ошибку
    return JsonResponse({'success': False, 'user': 'Неверный метод запроса.'})


@csrf_exempt
def send_code(request):

    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        print(email)

        try:
            auth_code = send_verification_code(email)

            if not auth_code:
                return JsonResponse({'success': False, 'message': 'Ошибка при отправке кода подтверждения.'})

            request.session['auth_code'] = auth_code
            # Возвращаем успешный JSON-ответ
            return JsonResponse({
                'success': True,
                'message': 'Код подтверждения отправлен на ваш email.',
                'code': auth_code
            })
        except Exception as e:
            print(f"Ошибка при отправке кода: {e}")
            return JsonResponse({'success': False, 'message': 'Ошибка при отправке кода подтверждения.'})

    # Если запрос не POST, возвращаем ошибку
    return JsonResponse({'success': False, 'message': 'Неверный метод запроса.'})

@csrf_exempt
def check_user(request):
    print("check user...")

    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            print("User Error")
            return JsonResponse({'success': False, 'message': 'Пользователь с таким email не существует.'})


        pass_legit = check_password(password, user.password_hash)

        if pass_legit:
            return JsonResponse({'success': True, 'message': 'Пароль верный'})
        else:
            return JsonResponse({'success': False, 'message': 'Неверный пароль.'})


def send_verification_code(email):
    code = str(random.randint(1000, 9999))
    try:
        send_mail(
            'Ваш код подтверждения',
            f"Ваш код подтверждения: {code}. Пожалуйста, не сообщайте его третьим лицам."
               f"Если это не вы пытаетесь войти в аккаунт - просто игнорируйте это сообщение.",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return code
    except Exception as e:
        print(f"Ошибка отправки email: {e}")

def send_new_password(email, password):
    try:
        send_mail(
            'Ваш код подтверждения',
            f"Ваш новый пароль: {password}. Пожалуйста, не сообщайте его третьим лицам."
               f"Если это не вы пытаетесь войти в аккаунт - просто игнорируйте это сообщение.",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Ошибка отправки email: {e}")