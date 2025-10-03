from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from authorization.models import Favorites, Reviews
from .models import Subcategories, Products
from .views import products_view
from django.http import JsonResponse
from django.shortcuts import redirect


def filter_products(request, subcategory_name):
    if request.method == 'GET':
        current_subcategory = get_object_or_404(Subcategories, name=subcategory_name)

        # Получаем параметры фильтрации из запроса
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        sizes = request.GET.getlist('sizes[]')
        colors = request.GET.getlist('colors[]')

        # Фильтруем товары
        products = Products.objects.filter(subcategory=current_subcategory)

        if ((sizes == ['']) or (colors == [''])) == False:
            products_view(request, subcategory_name)

        if min_price and max_price:
            products = products.filter(price__gte=min_price, price__lte=max_price)
        if sizes:
            products = products.filter(productinventory__size__in=sizes).distinct()
        if colors:
            products = products.filter(productinventory__color__in=colors).distinct()

        # Формируем JSON-ответ
        data = [
            {
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'image_url': product.image_url,
            }
            for product in products
        ]

        return JsonResponse(data, safe=False)


@csrf_exempt
def toggle_favorite(request, subcategory_name, product_id):
    if request.method == 'POST':
        user_id = request.session.get('user_id')

        # Проверяем, существует ли запись в избранном
        favorite_exists = Favorites.objects.filter(product_id=product_id, user_id=user_id).exists()

        if favorite_exists:
            # Удаляем запись из избранного
            Favorites.objects.filter(product_id=product_id, user_id=user_id).delete()
            return JsonResponse({'status': 'removed', 'message': 'Товар удален из избранного.'})
        else:
            # Добавляем запись в избранное
            Favorites.objects.create(product_id=product_id, user_id=user_id)
            return JsonResponse({'status': 'added', 'message': 'Товар добавлен в избранное.'})

    return JsonResponse({'status': 'error', 'message': 'Неверный метод запроса.'}, status=400)


def change_review(request, subcategory_name, product_id):
    if request.method == 'POST':
        try:
            user_id = request.session.get('user_id')
            star = request.POST.get('star')
            description = request.POST.get('description')

            if not user_id:
                return JsonResponse({'status': 'error', 'message': 'Пользователь не авторизован.'})

            review = Reviews.objects.filter(product_id=product_id, user_id=user_id).first()
            if review:
                review.stars = int(star)
                review.description = f"{description}"
                review.save()
                return redirect('product_detail', subcategory_name=subcategory_name, product_id=product_id)
            else:
                return JsonResponse({'status': 'error', 'message': 'Отзыв не найден.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Ошибка: {str(e)}'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Метод запроса не поддерживается.'})