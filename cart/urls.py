from django.urls import path
from . import views
from . import services

urlpatterns = [
    path('order', views.order, name='order'),
    path('cart_update/', views.update_product, name='update_product'),
    path('', views.cart_view, name='cart'),
    path('add-card/', services.add_card_view, name='add_card'),
    path('create-order/', services.create_order, name='create_order'),
]