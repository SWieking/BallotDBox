from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import Max
from .blockchain_utils import add_candidate_to_blockchain, delete_candidate_from_blockchain, update_candidate_on_blockchain, add_etherum_address_to_blockchain, setElectionTime
import datetime

#extends the default Django user model with additional fields
class CustomUser(AbstractUser):
    id_number = models.CharField(max_length=10,unique=True)
    has_registered_ethereum_address = models.BooleanField(default=False)

#model representing a voter eligible to register and vote
class EligibleVoter(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=10)
    id_pin = models.CharField(max_length=128)

    def save(self, *args, **kwargs):
        #hash the id_pin before saving the eligible voter record
        self.id_pin = make_password(self.id_pin)
        super().save(*args, **kwargs)

    def __string__(self):
        return f"{self.first_name} {self.last_name}"
    
#model representing an Ethereum address associated with a voter
class EthereumAddress(models.Model):
    address = models.CharField(max_length=42, unique=True)
    is_on_blockchain = models.BooleanField(default=False)
    has_voted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.pk:
                self.add_to_blockchain()
            super().save(*args, **kwargs)
    
    def add_to_blockchain(self):
        response = add_etherum_address_to_blockchain(self.address)
        if response !=  'success':
            raise Exception(f'Failed to add Candidate to blockchain, rollback changes ({response})')
        self.is_on_blockchain = True

    def __str__(self):
        status = " " if self.is_on_blockchain else " not "
        return f"Ethereum Address {self.address} is{status}on Blockchain"
    
#model representing a candidate in the election
class Candidate(models.Model):
    name = models.CharField(max_length=255)
    party = models.CharField(max_length=255)
    age = models.IntegerField(default=18)
    blockchain_id = models.IntegerField(unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.pk:
                #increment the maximum blockchain ID by 1 to ensure it starts from 1 (avoid solidity deault value 0).
                #if there are no existing IDs (e.g., database is empty), set the next ID to 1.
                self.blockchain_id = Candidate.objects.aggregate(Max('blockchain_id',default = 0))['blockchain_id__max'] +1
                response = add_candidate_to_blockchain(self.blockchain_id,self.name, self.party) 
                if response !=  'success':
                    raise Exception(f'Failed to add Candidate to blockchain, rollback changes ({response})')
                super().save(*args, **kwargs)
            else:
                #if the candidate exists, update their information on the blockchain
                response = update_candidate_on_blockchain(self.blockchain_id,self.name, self.party) 
                if response != 'success':
                    raise Exception(f'Failed to edit Candidate on blockchain, rollback changes ({response})')

    def delete(self,*args, **kwargs):
        with transaction.atomic():
            #remove the candidate from the blockchain before deleting the record
            response = delete_candidate_from_blockchain(self.blockchain_id)
            if response !=  'success':
                raise Exception(f'Failed to remove from blockchain, rollback changes ({response})')
            super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.party})"
    
#model representing the start and end times of the election
class ElectionTime(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def save(self, *args, **kwargs):
        with transaction.atomic():
            #ensure there is only one instance of ElectionTime
            if not self.pk and ElectionTime.objects.exists(): 
                raise Exception('There can be only one ElectionTime instance') 
            #set the election times on the blockchain
            response = setElectionTime(int(self.start_time.timestamp()), int(self.end_time.timestamp()))
            if response != 'success':
                raise Exception(f'Failed to set Election times, rollback changes ({response})')
            super().save(*args,**kwargs) 

#model for storing blockchain contract details
class BlockchainInfo(models.Model):
    contract_address = models.CharField(max_length=42)
    abi = models.JSONField()
