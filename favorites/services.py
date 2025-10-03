from authorization.models import Favorites
from django.http import JsonResponse

def remove_favorite(request, pk):
    if request.method == 'DELETE':
        try:
            favorite = Favorites.objects.get(id=pk, user_id=request.session['user_id'])
            favorite.delete()
            return JsonResponse({'success': True})
        except Favorites.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Товар не найден'}, status=404)
    return JsonResponse({'success': False, 'error': 'Неверный метод запроса'}, status=400)