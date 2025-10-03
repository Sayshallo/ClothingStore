import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import requests

from authorization.models import Reviews
from cart.models import CreditCard
from catalog.models import Orders, OrderItems, ProductInventory
from main.models import Cart
from django.contrib.auth.hashers import check_password


def get_card_info(card_number):
    # Берём первые 6 цифр (BIN-код)
    bin_code = card_number[:6]

    # Используем бесплатный API Binlist для получения данных
    url = f"https://lookup.binlist.net/{bin_code}"
    headers = {"Accept-Version": "3"}

    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return {"error": "Не удалось получить данные о карте."}

        data = response.json()

        # Формируем результат
        card_info = {
            "card_number": card_number,
            "scheme": data.get("scheme", "Неизвестная платёжная система"),
            "type": data.get("type", "Неизвестный тип карты"),
            "brand": data.get("brand", "Неизвестный бренд"),
            "bank": data.get("bank", {}).get("name", "Неизвестный банк"),
            "country": data.get("country", {}).get("name", "Неизвестная страна"),
            "currency": data.get("currency", "Неизвестная валюта"),
        }

        return card_info
    except Exception as e:
        return {"error": f"Произошла ошибка: {str(e)}"}

def add_card_view(request):
    # Проверяем, авторизован ли пользователь
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'status': 'error', 'message': 'Пользователь не авторизован.'}, status=401)

    if request.method == 'POST':
        # Получаем данные из POST-запроса
        card_number = request.POST.get('card_number')
        expiry_date = request.POST.get('expiry_date')
        cvv = request.POST.get('cvv')

        # Проверяем, что все поля заполнены
        if not card_number or not expiry_date or not cvv:
            print("Ошибка: Не все поля заполнены.")
            return JsonResponse({'status': 'error', 'message': 'Заполните все поля.'})

        try:
            # Создаем новую запись в базе данных
            card = CreditCard.objects.create(
                user_id=user_id,  # Используем ID пользователя из сессии
                number=card_number,
                date=expiry_date,
                cvv=cvv  # CVV будет автоматически хэширован в методе save()
            )
            print(f"Карта успешно добавлена: {card}")
            return JsonResponse({'status': 'success', 'message': 'Карта успешно добавлена.'})
        except Exception as e:
            print(f"Ошибка при добавлении карты: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f'Ошибка: {str(e)}'})

    print("Неверный метод запроса.")
    return JsonResponse({'status': 'error', 'message': 'Неверный метод запроса.'})

@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Получаем данные из запроса
            user_id = request.session.get('user_id')
            total_price = data.get('total_price')
            status = data.get('status')
            comment = data.get('comment')
            card_number = data.get('card_number')
            cvv = data.get('cvv')
            items = str(data.get('items')).split()

            # Поиск карты по номеру (если оплата картой)
            card = None
            if card_number:
                card = CreditCard.objects.filter(number__endswith=card_number).first()

                if not card:
                    return JsonResponse({'status': 'error', 'message': 'Карта не найдена.'})

                if check_password(cvv, card.cvv):
                    pass
                else:
                    return JsonResponse({'status': 'error', 'message': 'Неверный CVV код.'})



            # Создание заказа
            order = Orders.objects.create(
                user_id=user_id,
                order_date=now(),
                total_price=total_price,
                status=status,
                comment=comment,
                card=card
            )

            # Создание деталей заказа
            for i in items:
                item = i.split('_')
                cart_el = Cart.objects.filter(product_id=item[0], color=item[1], size=item[2]).first()

                # Создание элементов заказа
                try:
                    OrderItems.objects.create(
                        order_id=order.id,
                        product_id=cart_el.product_id,
                        quantity=cart_el.quantity,
                        size=cart_el.size,
                        color=cart_el.color
                    )
                except Exception as e:
                    return JsonResponse({'status': 'error', 'message': str(e)})

                # Уменьшение количества товара в таблице product_inventory
                try:
                    inventory_item = ProductInventory.objects.filter(
                        product_id=cart_el.product_id,
                        size=cart_el.size,
                        color=cart_el.color
                    ).first()

                    if inventory_item:
                        if inventory_item.quantity >= cart_el.quantity:
                            inventory_item.quantity -= cart_el.quantity
                            inventory_item.save()
                        else:
                            return JsonResponse({
                                'status': 'error',
                                'message': f'Недостаточно товара на складе для {cart_el.product_id} (размер: {cart_el.size}, цвет: {cart_el.color}).'
                            })
                    else:
                        return JsonResponse({
                            'status': 'error',
                            'message': f'Товар не найден в инвентаре (ID: {cart_el.product_id}, размер: {cart_el.size}, цвет: {cart_el.color}).'
                        })
                except Exception as e:
                    return JsonResponse({'status': 'error', 'message': str(e)})

                # Добавление записи в таблицу отзывов (если её ещё нет)
                if not Reviews.objects.filter(product_id=cart_el.product_id, user_id=user_id).exists():
                    Reviews.objects.create(
                        product_id=cart_el.product_id,
                        user_id=user_id,
                        description='',  # Пустое описание
                        stars=None  # Количество звёзд пока не указано
                    )

                # Удаление элемента с корзины
                Cart.objects.filter(id=cart_el.id).delete()

            return JsonResponse({'status': 'success', 'message': 'Заказ успешно создан.', 'order_id': order.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})