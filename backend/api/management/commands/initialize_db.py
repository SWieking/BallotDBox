import json 
from django.apps import apps
from django.db import transaction
from django.core.management.base import BaseCommand
from api.models import EligibleVoter, Candidate
from django.conf import settings
import os

class Command(BaseCommand):
    help = "Load dummy eligible voters from JSON file into database, clearing old data first"

    def clear_data(self):
        models = apps.get_models()
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
    
    def handle(self, *args, **options):
        
        with transaction.atomic():
            try:
                self.clear_data()
                self.load_voters()
                self.load_candidates()
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'An error occurred: {str(e)}'))
        