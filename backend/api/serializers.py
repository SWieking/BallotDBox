from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EligibleVoter, EthereumAddress


class CostumUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id','username', 'first_name', 'last_name', 'id_number']


class AdminEligibleVotersSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibleVoter
        fields = '__all__'  

class EthereumAddressSerializer(serializers.ModelSerializer):
    model = EligibleVoter
    fields = ['address', 'is_on_blockchain']