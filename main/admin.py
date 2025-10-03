from django.contrib import admin

from .models import (
    AuthGroup, AuthGroupPermissions, AuthPermission, AuthUser,
    AuthUserGroups, AuthUserUserPermissions, Cart, Categories,
    DjangoAdminLog, DjangoContentType, DjangoMigrations, DjangoSession,
    Products, Subcategories, Users
)

from catalog.models import ViewHistory

admin.site.register(AuthGroup)
admin.site.register(AuthGroupPermissions)
admin.site.register(AuthPermission)
admin.site.register(AuthUser)
admin.site.register(AuthUserGroups)
admin.site.register(AuthUserUserPermissions)
admin.site.register(Cart)
admin.site.register(Categories)
admin.site.register(DjangoAdminLog)
admin.site.register(DjangoContentType)
admin.site.register(DjangoMigrations)
admin.site.register(DjangoSession)
admin.site.register(Products)
admin.site.register(Subcategories)
admin.site.register(Users)
admin.site.register(ViewHistory)
