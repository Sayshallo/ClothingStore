from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
import json
from authorization.models import Favorites, Reviews
from .models import Categories, Subcategories, Products, Users, Cart
from django.contrib import messages
from django.utils.timezone import now
from catalog.models import ViewHistory, ProductInventory
from django.db.models import Min, Max
from itertools import chain

def catalog_view(request, category_name):
    categories = Categories.objects.exclude(name__isnull=True).exclude(name='')
    current_category = get_object_or_404(Categories, name=category_name)
    subcategories = Subcategories.objects.filter(category=current_category)
    products = Products.objects.all()

    user_id = request.session.get('user_id')
    user = None
    if user_id:
        try:
            user = Users.objects.get(id=user_id)
        except Users.DoesNotExist:
            pass

    return render(request, 'catalog/category_detail.html', {
        'products': products,
        'categories': categories,
        'category': current_category,
        'subcategories': subcategories,
        'user': user,
    })


def products_view(request, subcategory_name):
    user_id = request.session.get('user_id')
    user = None
    if user_id:
        try:
            user = Users.objects.get(id=user_id)
        except Users.DoesNotExist:
            pass

    categories = Categories.objects.all()
    current_subcategory = get_object_or_404(Subcategories, name=subcategory_name)

    # Получаем минимальную и максимальную цену
    price_range = Products.objects.filter(subcategory=current_subcategory).aggregate(
        min_price=Min('price'),
        max_price=Max('price')
    )

    # Получаем уникальные размеры и цвета
    sizes = ProductInventory.objects.filter(product__subcategory=current_subcategory).values_list('size', flat=True).distinct()
    colors = ProductInventory.objects.filter(product__subcategory=current_subcategory).values_list('color', flat=True).distinct()

    # Фильтрация товаров
    products = Products.objects.filter(subcategory=current_subcategory)

    is_authenticated = 'user_id' in request.session

    return render(request, 'catalog/category_products.html', {
        'current_subcategory': current_subcategory,
        'products': products,
        'categories': categories,
        'is_authenticated': is_authenticated,
        'min_price': price_range['min_price'],
        'max_price': price_range['max_price'],
        'sizes': sizes,
        'colors': colors,
        'user': user,
    })

def filtered_products_view(request, subcategory_name):
    # Получаем текущую подкатегорию
    current_subcategory = get_object_or_404(Subcategories, name=subcategory_name)

    # Базовый запрос для товаров
    products = Products.objects.filter(subcategory=current_subcategory.id)

    price_range = Products.objects.filter(subcategory=current_subcategory).aggregate(
        min_price=Min('price'),
        max_price=Max('price')
    )

    selected_sizes = request.GET.getlist('sizes')[0].split(',')
    selected_colors = request.GET.getlist('colors')[0].split(',')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    sizes = ProductInventory.objects.filter(product__subcategory=current_subcategory).values_list('size', flat=True).distinct()
    colors = ProductInventory.objects.filter(product__subcategory=current_subcategory).values_list('color', flat=True).distinct()

    product_ids_with_colors = []
    product_ids_with_sizes = []

    if len(selected_sizes) != 0:
        for size in selected_sizes:
            inventory_items = ProductInventory.objects.filter(size=size)
            for item in inventory_items:
                product_ids_with_sizes.append(item.product_id)
        if (len(selected_sizes) > 1):
            product_ids_with_sizes = [id for id in product_ids_with_sizes if product_ids_with_sizes.count(id) > 1]
        product_ids_with_sizes = list(set(product_ids_with_sizes))

    if len(selected_colors) != 0:
        for color in selected_colors:
            inventory_items = ProductInventory.objects.filter(color=color)
            for item in inventory_items:
                product_ids_with_colors.append(item.product_id)
        if (len(selected_colors) > 1):
            product_ids_with_colors = [id for id in product_ids_with_colors if product_ids_with_colors.count(id) > 1]
        product_ids_with_colors = list(set(product_ids_with_colors))

    result_list = list(chain(product_ids_with_colors, product_ids_with_sizes))
    if len(product_ids_with_colors) > 1 and len(product_ids_with_sizes) > 1:
        result_list = [id for id in result_list if result_list.count(id) > 1]
    result_list = list(set(result_list))

    if min_price and max_price:
        # Преобразование значений в числа
        min_price = float(min_price)
        max_price = float(max_price)

        # Проверка, что значения находятся в допустимом диапазоне
        if min_price < price_range['min_price'] or max_price > price_range['max_price']:
            # Если значения выходят за границы, использовать минимальную и максимальную цену подкатегории
            min_price = price_range['min_price']
            max_price = price_range['max_price']

        # Добавление фильтрации по цене
        products = products.filter(price__gte=min_price, price__lte=max_price)

    products = products.filter(id__in=result_list)

    categories = Categories.objects.all()
    subcategories = Subcategories.objects.filter(category=current_subcategory.category)

    user_id = request.session.get('user_id')
    user = None
    if user_id:
        try:
            user = Users.objects.get(id=user_id)
        except Users.DoesNotExist:
            pass

    return render(request, 'catalog/category_products.html', {
        'current_subcategory': current_subcategory,
        'products': products,
        'categories': categories,
        'category': current_subcategory.category,
        'subcategories': subcategories,
        'user': user,
        'sizes': sizes,
        'colors': colors,
        'min_price': price_range['min_price'],
        'max_price': price_range['max_price'],
    })




def product_detail_view(request, subcategory_name, product_id):
    categories = Categories.objects.all()
    product = get_object_or_404(Products, id=product_id)
    inventory = ProductInventory.objects.filter(product=product)
    colors = inventory.values_list('color', flat=True).distinct()
    sizes = inventory.values_list('size', flat=True).distinct()
    is_authenticated = 'user_id' in request.session

    inventory_data = {}
    for item in inventory:
        if item.product_id not in inventory_data:
            inventory_data[item.product_id] = {}
        if item.size not in inventory_data[item.product_id]:
            inventory_data[item.product_id][item.size] = {}
        inventory_data[item.product_id][item.size][item.color] = item.quantity


    user_id = request.session.get('user_id')  # Получаем user_id из сессии
    if user_id:
        # Получаем товары из корзины пользователя
        cart_items = Cart.objects.filter(user_id=user_id, product_id=product_id)

        # Вычитаем из инвентаря количество товаров, уже добавленных в корзину
        for cart_item in cart_items:
            product_id = cart_item.product_id
            size = cart_item.size
            color = cart_item.color
            quantity_in_cart = cart_item.quantity

            if (
                product_id in inventory_data and
                size in inventory_data[product_id] and
                color in inventory_data[product_id][size]
            ):
                # Уменьшаем доступное количество в инвентаре
                inventory_data[product_id][size][color] -= quantity_in_cart

                if inventory_data[product_id][size][color] < 0:
                    inventory_data[product_id][size][color] = 0

    if request.method == 'POST':
        user_id = request.session.get('user_id')

        # Получаем данные из POST-запроса
        size = request.POST.get('size')
        color = request.POST.get('color')
        quantity = int(request.POST.get('quantity', 0))

        # Проверяем, что все данные предоставлены
        if not size or not color or quantity <= 0:
            messages.error(request, "Please select size, color, and quantity.")
            return redirect('product_detail', subcategory_name=subcategory_name, product_id=product_id)

        # Проверяем, есть ли уже такая запись в корзине
        cart_item, created = Cart.objects.get_or_create(
            user_id=user_id,
            product_id=product_id,
            size=size,
            color=color,
            defaults={'quantity': quantity}
        )

        if not created:
            # Если запись уже существует, увеличиваем количество
            cart_item.quantity += quantity
            cart_item.save()

        # Сохраняем сообщение об успехе
        messages.success(request, "Product added to cart successfully!")

        # Перенаправляем пользователя после успешного добавления
        return redirect('product_detail', subcategory_name=subcategory_name, product_id=product_id)

    if is_authenticated:
        user_id = request.session.get('user_id')

        # Проверяем, есть ли уже запись о просмотре этого товара
        view_entry, created = ViewHistory.objects.get_or_create(
            user_id=user_id,
            product=product,
            defaults={'viewed_at': now()}
        )

        if created:
            print("New record created.")
        else:
            print("Existing record updated.")

        # Обновляем время просмотра
        view_entry.viewed_at = now()
        view_entry.save()
        print("Record saved successfully.")

    user_id = request.session.get('user_id')
    user = None
    if user_id:
        try:
            user = Users.objects.get(id=user_id)
        except Users.DoesNotExist:
            pass

    isFavorite = Favorites.objects.filter(product_id=product_id, user_id=user_id).exists()

    review = None
    if user:
        review = Reviews.objects.filter(product_id=product_id, user_id=user_id).first()

    context = {
        'categories': categories,
        'product': product,
        'colors': colors,
        'sizes': sizes,
        'is_authenticated': is_authenticated,
        'subcategory_name': subcategory_name,
        'inventory_data': inventory_data,
        'user': user,
        'isFavorite': isFavorite,
        'review': review,
    }
    return render(request, 'catalog/product_detail.html', context)




