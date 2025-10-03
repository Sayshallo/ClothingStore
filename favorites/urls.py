from django.urls import path
from favorites import views, services

urlpatterns = [
    path('', views.fav_view, name='favorites'),
    path('favorites/remove/<int:pk>/', services.remove_favorite, name='remove_favorite'),
]