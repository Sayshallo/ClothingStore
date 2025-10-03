from cart.models import CreditCard
from django.shortcuts import render
from catalog.models import Cart, Products, ProductInventory, Categories
from django.contrib import messages
from django.shortcuts import redirect
from django.contrib.messages import get_messages

def update_product(request):
    if request.method == 'POST':
        # Получаем данные из POST-запроса
        product_id = request.POST.get('id')
        size = request.POST.get('size')
        color = request.POST.get('color')
        new_quantity = int(request.POST.get('new_qnt'))

        # Получаем user_id из сессии
        user_id = request.session.get('user_id')

        if user_id:
            # Находим запись в корзине
            cart_item = Cart.objects.filter(
                user_id=user_id,
                product_id=product_id,
                size=size,
                color=color
            ).first()

            if cart_item:
                # Проверяем доступное количество в таблице product_inventory
                inventory_item = ProductInventory.objects.filter(
                    product_id=product_id,
                    size=size,
                    color=color
                ).first()

                if inventory_item and new_quantity > inventory_item.quantity:
                    # Если количество превышает доступное, отправляем сообщение об ошибке
                    messages.warning(request, "Товара недостаточно на складе")
                    return redirect('cart')  # Перенаправляем на страницу корзины

                # Обновляем количество в корзине
                if new_quantity > 0:
                    cart_item.quantity = new_quantity
                    cart_item.save()
                    messages.success(request, "Успешно!")
                    return redirect('cart')  # Перенаправляем на страницу корзины
                else:
                    # Удаляем запись, если количество равно 0
                    cart_item.delete()
                    messages.success(request, "Товар удален из корзины")
                    return redirect('cart')  # Перенаправляем на страницу корзины

        return redirect('cart')  # Перенаправляем на страницу корзины

def cart_view(request):
    categories = Categories.objects.all()
    user_id = request.session.get('user_id')

    # Если пользователь не авторизован, корзина пуста
    if not user_id:
        return render(request, 'cart/cart.html', {'cart_items': []})

    # Получаем все товары в корзине пользователя
    cart_items = Cart.objects.filter(user_id=user_id).order_by('id')

    # Создаем список для хранения расширенных данных о товарах
    cart_data = []
    total = 0

    for item in cart_items:
        # Находим продукт по product_id
        product = Products.objects.get(id=item.product_id)

        item_total = float(product.price) * int(item.quantity)
        total += item_total

        # Добавляем данные в список
        cart_data.append({
            'id': item.product_id,
            'product_name': product.name,
            'color': item.color,
            'size': item.size,
            'quantity': item.quantity,
            'price': product.price,
        })

        # Получаем сообщения
    storage = get_messages(request)
    message_list = [{'message': message.message, 'tags': message.tags} for message in storage]

    request.session['order_total'] = round(total, 2)

    # Передаем данные в шаблон
    context = {
        'categories': categories,
        'cart_items': cart_data,
        'messages': message_list,
    }
    return render(request, 'cart/cart.html', context)


def order(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')

    is_authenticated = 'user_id' in request.session

    total_cost = 0
    if request.method == 'POST':
        total_cost = request.POST.get('total_cost')

    items = str(request.POST.getlist('selected_items')).replace('[', '').replace('\'', '').replace(']', '').replace(',', '')


    context = {
        'is_authenticated': is_authenticated,
        'categories': Categories.objects.all(),
        'summa': total_cost,
        'cards': CreditCard.objects.filter(user_id=user_id),
        'items': items,
    }

    return render(request, 'cart/order.html', context)
