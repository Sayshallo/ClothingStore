from django.shortcuts import render
from .models import Categories, Users

def home(request):
    user_id = request.session.get('user_id')
    user = None
    if user_id:
        try:
            user = Users.objects.get(id=user_id)
        except Users.DoesNotExist:
            pass

    categories = Categories.objects.exclude(name__isnull=True).exclude(name='')
    context = {
        'categories': categories,
        'user': user,
    }

    return render(request, 'main/home.html', context)