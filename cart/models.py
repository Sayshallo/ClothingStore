from django.db import models
from django.contrib.auth.hashers import make_password

class CreditCard(models.Model):
    user_id = models.IntegerField()  # ID пользователя
    number = models.CharField(max_length=16)  # Номер карты (16 цифр)
    date = models.CharField(max_length=4)  # Дата истечения (MM/YY)
    cvv = models.CharField(max_length=128)  # Хэшированный CVV

    class Meta:
        db_table = 'credit_cards'  # Явное указание имени таблицы

    def save(self, *args, **kwargs):
        # Хэшируем CVV перед сохранением
        if not self.cvv.startswith('pbkdf2_sha256$'):
            self.cvv = make_password(self.cvv)
        super().save(*args, **kwargs)