from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.db import transaction
from django.db.models import Max
from .blockchain_utils import add_candidate_to_blockchain, delete_candidate_from_blockchain, update_candidate_on_blockchain, add_etherum_address_to_blockchain

class CustomUser(AbstractUser):
    id_number = models.CharField(max_length=10,unique=True)

class EligibleVoter(models.Model):
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=10)
    id_pin = models.CharField(max_length=128)

    def save(self, *args, **kwargs):
        self.id_pin = make_password(self.id_pin)
        super().save(*args, **kwargs)

    def __string__(self):
        return f"{self.first_name} {self.last_name}"
    

class EthereumAddress(models.Model):
    address = models.CharField(max_length=42, unique=True)
    is_on_blockchain = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.pk:
                response = add_etherum_address_to_blockchain(self.address)
                if response !=  'success':
                    raise Exception(f'Failed to add Candidate to blockchain, rollback changes ({response})')
                super().save(*args, **kwargs)

    def __str__(self):
        status = " " if self.is_on_blockchain else " not "
        return f"Ethereum Address {self.address} is{status}on Blockchain"
    
class Candidate(models.Model):
    name = models.CharField(max_length=255)
    party = models.CharField(max_length=255)
    blockchain_id = models.IntegerField(unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.pk:
                # Increment the maximum blockchain ID by 1 to ensure it starts from 1 (avoid solidity deault value 0).
                # If there are no existing IDs (e.g., database is empty), set the next ID to 1.
                self.blockchain_id = Candidate.objects.aggregate(Max('blockchain_id',default = 0))['blockchain_id__max'] +1
                response = add_candidate_to_blockchain(self.blockchain_id,self.name, self.party) 
                if response !=  'success':
                    raise Exception(f'Failed to add Candidate to blockchain, rollback changes ({response})')
                super().save(*args, **kwargs)
            else:
                response = update_candidate_on_blockchain(self.blockchain_id,self.name, self.party) 
                if response != 'success':
                    raise Exception(f'Failed to edit Candidate on blockchain, rollback changes ({response})')

    def delete(self,*args, **kwargs):
        with transaction.atomic():
            super().delete(*args, **kwargs)
            response = delete_candidate_from_blockchain(self.blockchain_id)
            if response !=  'success':
                raise Exception(f'Failed to remove from blockchain, rollback changes ({response})')
          
    def __str__(self):
        return f"{self.name} ({self.party})"
