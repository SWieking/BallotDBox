from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EligibleVoter, EthereumAddress, Candidate, ElectionTime


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id','username', 'password', 'first_name', 'last_name', 'id_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_date):
        user = get_user_model().objects.create_user(**validated_date)
        return user


class AdminEligibleVotersSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibleVoter
        fields = '__all__'  

class EthereumAddressSerializer(serializers.ModelSerializer):
    model = EthereumAddress
    fields = ['address', 'is_on_blockchain']

class CandidateSerializer(serializers.ModelSerializer):
    model = Candidate
    field = ['id', 'name', 'party']

class ElectionTimeSerializer(serializers.ModelSerializer):
    model =  ElectionTime
    fields = ['start_time','end_time']