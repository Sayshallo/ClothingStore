from django.urls import path
from . import views
from . import services

urlpatterns = [
    path('<str:subcategory_name>/products/', views.products_view, name='products'),
    path('<str:category_name>/', views.catalog_view, name='category_detail'),
    path('<str:subcategory_name>/products/<int:product_id>/', views.product_detail_view, name='product_detail'),
    path('<str:subcategory_name>/products/filtered/', views.filtered_products_view, name='filtered_products_view'),
    path('<str:subcategory_name>/products/<int:product_id>/toggle_favorite/', services.toggle_favorite, name='toggle_favorite'),
    path('<str:subcategory_name>/products/<int:product_id>/change_review/', services.change_review, name='change_review'),
]