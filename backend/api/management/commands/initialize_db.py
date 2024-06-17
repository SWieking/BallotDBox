import json 
from django.apps import apps
from django.db import transaction
from django.core.management.base import BaseCommand, CommandParser
from api.models import EligibleVoter, Candidate, ElectionTime, EthereumAddress, BlockchainInfo, CustomUser
from django.conf import settings
from datetime import datetime, timedelta, timezone
import json
import os

class Command(BaseCommand):
    help = "Initializing DB, clearing old data first"

    def add_arguments(self, parser):
        parser.add_argument(
            '--hard',
            action='store_true',
            help='If specified, perform hard reset (clear all models)',
        )

    def clear_data(self, hard_reset):
        if hard_reset:
            models = apps.get_models()
        else:
            models = [EligibleVoter, EthereumAddress, Candidate, ElectionTime, BlockchainInfo]
        
        for model in models:
            try:
                model.objects.all().delete()
                self.stdout.write(self.style.SUCCESS(f'Cleared all data from {model.__name__}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'An error occured while trying to delete all data from {model.__name__}: {str(e)}'))


    def load_voters(self, *args, **kwargs):
        json_file_path = settings.BASE_DIR / 'api' / 'management' / 'fixtures' / 'dummy_voters.json'

        with open(json_file_path, 'r') as file:
            voters = json.load(file)
            for voter in voters:
                EligibleVoter.objects.create(**voter)
        self.stdout.write(self.style.SUCCESS('Successfully loaded all voters.'))
        

    def load_candidates(self):
        json_file_path = settings.BASE_DIR / 'api' / 'management' / 'fixtures' / 'dummy_candidates.json'
       
        with open(json_file_path, 'r') as file:
            candidates = json.load(file)
            for candidate in candidates:
                Candidate.objects.create(**candidate)
            self.stdout.write(self.style.SUCCESS('Successfully loaded all candidates.'))
    
    def set_times(self):
        current_time = datetime.now(timezone.utc)
        start_time = current_time + timedelta(seconds=20) 
        end_time = current_time + timedelta(hours=1000)
        ElectionTime.objects.create(start_time=start_time,end_time=end_time)
        self.stdout.write(self.style.SUCCESS('Successfully set election times'))

    def load_blockchain_info(self):
        contract_address = settings.BC_CONTRACT_ADDRESS
        abi_path = settings.BC_ABI_PATH

        with open(abi_path, 'r') as file:
            abi = json.load(file)['abi']
        BlockchainInfo.objects.create(contract_address=contract_address, abi=abi)
        self.stdout.write(self.style.SUCCESS('Successfully loaded blockchain info'))
    
    def set_has_address_false(self):
        users = CustomUser.objects.all()
        for user in users:
            user.has_registered_ethereum_address = False
            user.save()
        self.stdout.write(self.style.SUCCESS('Successfully set has_registered_ethereum_address to default for all users'))


    def handle(self, *args, **options):

        hard_reset = options['hard']
        
        with transaction.atomic():
            try:
                self.clear_data(hard_reset)
                if not hard_reset: self.set_has_address_false()
                self.load_voters()
                self.load_candidates()
                self.set_times()
                self.load_blockchain_info()
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'An error occurred: {str(e)}'))
        