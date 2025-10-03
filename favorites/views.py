from django.shortcuts import render
from authorization.models import Favorites
from catalog.models import Categories


def fav_view(request):
    favorites = Favorites.objects.filter(user_id=request.session['user_id'])
    return render(request, 'favorites/fav.html', context={
        'favorites': favorites,
        'categories': Categories.objects.all(),
    })
