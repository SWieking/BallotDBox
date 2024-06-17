from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EligibleVoter, EthereumAddress, Candidate, ElectionTime, BlockchainInfo


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id','username', 'password', 'first_name', 'last_name', 'id_number', 'has_registered_ethereum_address']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_date):
        user = get_user_model().objects.create_user(**validated_date)
        return user


class AdminEligibleVotersSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibleVoter
        fields = '__all__'  

class EthereumAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EthereumAddress
        fields = ['address', 'is_on_blockchain', 'has_voted']

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = ['id', 'name', 'party', 'blockchain_id']

class ElectionTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model =  ElectionTime
        fields = ['start_time','end_time']

class BlockchainInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockchainInfo
        fields = '__all__'
        