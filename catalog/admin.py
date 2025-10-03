from django.contrib import admin
# catalog/admin.py
from django.contrib import admin
from .models import Products, ProductInventory, Orders, OrderItems

@admin.register(ProductInventory)
class ProductInventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'size', 'color', 'quantity')
    search_fields = ('product__name', 'size', 'color')
    list_filter = ('size', 'color')

admin.site.register(Orders)
admin.site.register(OrderItems)

