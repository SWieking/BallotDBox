from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.conf import settings

class CostumUser(AbstractUser):
    id_number = models.CharField(max_length=20,unique=True)

class EligibleVoter(models.Model):
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20)
    id_pin_hash = models.CharField(max_length=128)

    def save(self, *args, **kwargs):
        self.id_pin_hash = make_password(self.id_pin_hash)
        super().save(*args, **kwargs)

    def __string__(self):
        return f"{self.first_name} {self.last_name}"
    

class EthereumAddress(models.Model):
    address = models.CharField(max_length=42, unique=True)
    is_on_blockchain = models.BooleanField(default=False)

    def __str__(self):
        return f"Ethereum Address {self.address} is{" " if self.is_on_blockchain else " not "}on Blockchain" 