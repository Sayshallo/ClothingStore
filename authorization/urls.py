from django.urls import path
from . import views
from . import services

urlpatterns = [
    path('auth/', views.authorization_view, name='authorization'),  # Страница авторизации/регистрации
    path('login/', views.login_view, name='login'),  # Обработчик входа
    path('send_code/', services.send_code, name='send_code'),
    path('check_user/', services.check_user, name='check_user'),
    path('login/save_user/', services.save_user, name='save_user'),
    path('login/register/', services.add_user, name='register'),
    path('lk/', views.lk_view, name='lk'),  # Личный кабинет
    path('logout/', views.logout_view, name='logout'),  # Выход из аккаунта
    path('delete-account/', views.delete_account_view, name='delete_account'),  # Удаление аккаунта
    path('lk/get-orders/', services.get_orders, name='get_orders'),
    path('lk/get_order_details/', services.get_order_details, name='get_order_details'),
    path('lk/get-reviews/', services.get_reviews, name='get_reviews'),
    path('lk/get-cards/', services.get_credit_cards, name='get_credit_cards'),
    path('lk/add_card/', services.add_card, name='add_cards'),
    path('lk/update_data/', services.update_data, name='update_data'),
    path('lk/delete_card/<int:card_id>/', services.delete_card, name='delete_card'),
]