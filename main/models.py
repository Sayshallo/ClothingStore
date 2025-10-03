from django.db import models
from django.utils.timezone import now




class AuthGroup(models.Model):

    name = models.CharField(unique=True, max_length=150)



    class Meta:

        managed = False

        db_table = 'auth_group'





class AuthGroupPermissions(models.Model):

    id = models.BigAutoField(primary_key=True)

    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)



    class Meta:

        managed = False

        db_table = 'auth_group_permissions'

        unique_together = (('group', 'permission'),)





class AuthPermission(models.Model):

    name = models.CharField(max_length=255)

    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)

    codename = models.CharField(max_length=100)



    class Meta:

        managed = False

        db_table = 'auth_permission'

        unique_together = (('content_type', 'codename'),)





class AuthUser(models.Model):

    password = models.CharField(max_length=128)

    last_login = models.DateTimeField(blank=True, null=True)

    is_superuser = models.BooleanField()

    username = models.CharField(unique=True, max_length=150)

    first_name = models.CharField(max_length=150)

    last_name = models.CharField(max_length=150)

    email = models.CharField(max_length=254)

    is_staff = models.BooleanField()

    is_active = models.BooleanField()

    date_joined = models.DateTimeField()



    class Meta:

        managed = False

        db_table = 'auth_user'





class AuthUserGroups(models.Model):

    id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)



    class Meta:

        managed = False

        db_table = 'auth_user_groups'

        unique_together = (('user', 'group'),)





class AuthUserUserPermissions(models.Model):

    id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)



    class Meta:

        managed = False

        db_table = 'auth_user_user_permissions'

        unique_together = (('user', 'permission'),)





class Cart(models.Model):

    user = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)

    product = models.ForeignKey('Products', models.DO_NOTHING, blank=True, null=True)

    quantity = models.IntegerField()

    size = models.CharField(max_length=4)

    color = models.CharField(max_length=32)



    class Meta:

        managed = False

        db_table = 'cart'





class Categories(models.Model):

    name = models.CharField(unique=True, max_length=100)



    class Meta:

        managed = False

        db_table = 'categories'





class DjangoAdminLog(models.Model):

    action_time = models.DateTimeField()

    object_id = models.TextField(blank=True, null=True)

    object_repr = models.CharField(max_length=200)

    action_flag = models.SmallIntegerField()

    change_message = models.TextField()

    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)

    user = models.ForeignKey(AuthUser, models.DO_NOTHING)



    class Meta:

        managed = False

        db_table = 'django_admin_log'





class DjangoContentType(models.Model):

    app_label = models.CharField(max_length=100)

    model = models.CharField(max_length=100)



    class Meta:

        managed = False

        db_table = 'django_content_type'

        unique_together = (('app_label', 'model'),)





class DjangoMigrations(models.Model):

    id = models.BigAutoField(primary_key=True)

    app = models.CharField(max_length=255)

    name = models.CharField(max_length=255)

    applied = models.DateTimeField()



    class Meta:

        managed = False

        db_table = 'django_migrations'





class DjangoSession(models.Model):

    session_key = models.CharField(primary_key=True, max_length=40)

    session_data = models.TextField()

    expire_date = models.DateTimeField()



    class Meta:

        managed = False

        db_table = 'django_session'





class OrderItems(models.Model):

    order = models.ForeignKey('Orders', models.DO_NOTHING, blank=True, null=True)

    product = models.ForeignKey('Products', models.DO_NOTHING, blank=True, null=True)

    quantity = models.IntegerField()



    class Meta:

        managed = False

        db_table = 'order_items'





class Orders(models.Model):

    user = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)

    order_date = models.DateTimeField(blank=True, null=True)

    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    status = models.CharField(max_length=20, blank=True, null=True)



    class Meta:

        managed = False

        db_table = 'orders'





class Products(models.Model):

    name = models.CharField(max_length=200)

    description = models.TextField(blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    subcategory = models.ForeignKey('Subcategories', models.DO_NOTHING, blank=True, null=True)

    image_url = models.CharField(max_length=255, blank=True, null=True)



    class Meta:

        managed = False

        db_table = 'products'





class Subcategories(models.Model):

    category = models.ForeignKey(Categories, models.DO_NOTHING, blank=True, null=True)

    name = models.CharField(max_length=100)

    image_url = models.URLField(blank=True, null=True, verbose_name="Image URL")



    class Meta:

        managed = False

        db_table = 'subcategories'





class Users(models.Model):

    username = models.CharField(unique=True, max_length=50)

    email = models.CharField(unique=True, max_length=100)

    phone = models.CharField(max_length=20, blank=True, null=True)

    password_hash = models.CharField(max_length=255)




    class Meta:

        managed = False

        db_table = 'users'

