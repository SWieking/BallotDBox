from django.shortcuts import render
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from .serializers import CustomUserSerializer, AdminEligibleVotersSerializer, EthereumAddressSerializer, CandidateSerializer, ElectionTimeSerializer, BlockchainInfoSerializer
from .models import EligibleVoter, EthereumAddress, Candidate, ElectionTime, BlockchainInfo
from django.contrib.auth.hashers import make_password
from django.utils.decorators import method_decorator
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404

class CreatCustomUserView(generics.CreateAPIView):

    queryset = get_user_model().objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):

        #extract voter details from the request
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        id_number = request.data.get('id_number')
        id_pin = request.data.get('id_pin')

        try:
            #check if the user details match an eligible voter in the database
            eligible_voter = EligibleVoter.objects.get(id_number=id_number, first_name=first_name, last_name=last_name)
            
            #verify that the provided PIN matches the stored PIN for this voter
            if check_password(id_pin, eligible_voter.id_pin):
                #if verification is successful, proceed with user creation
                return super().post(request, *args, **kwargs)
            else:
                return Response({'error': 'Verification failed. Please check your inputs and try again.'}, status=status.HTTP_400_BAD_REQUEST)

        except EligibleVoter.DoesNotExist:
            return Response({'error': 'Verification failed. Please check your inputs and try again.'}, status=status.HTTP_400_BAD_REQUEST)
        
class EligibleVoterAdminView(viewsets.ModelViewSet):
    queryset = EligibleVoter.objects.all()
    serializer_class = AdminEligibleVotersSerializer
    permission_classes = [permissions.IsAdminUser]

class CandidateAdminView(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [permissions.IsAdminUser]

class ElectionTimeAdminView(viewsets.ModelViewSet):
    queryset =  ElectionTime.objects.all()
    serializer_class = ElectionTimeSerializer
    permission_classes = [permissions.IsAdminUser]

class CandidateListView(generics.ListAPIView):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [permissions.IsAuthenticated]

class ElectionTimeListView(generics.ListAPIView):
    queryset = ElectionTime.objects.all()
    serializer_class = ElectionTimeSerializer
    permission_classes = [permissions.IsAuthenticated]

class AddEthereumAddressView(generics.CreateAPIView):
    queryset = EthereumAddress.objects.all()
    serializer_class = EthereumAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        #check if the user has already registered an Ethereum address
        #a user is allowed to register only one Ethereum address, so if they have already registered one, the request is denied
        if user.has_registered_ethereum_address:
            return Response({'detail': 'An address already registered for this User'}, status=status.HTTP_400_BAD_REQUEST)
        
        address = request.data.get('address')
        if not address:
            return Response({'detail': 'Address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        response = super().create(request, *args, **kwargs)

        #mark the user as having registered an Ethereum address
        user.has_registered_ethereum_address = True
        user.save()

        return response
    
#this view updates the 'has_voted' status of a user's Ethereum address to True after they have cast their vote
class EthereumAddressVoteUpdateView(generics.UpdateAPIView):
    
    queryset = EthereumAddress.objects.all()
    serializer_class = EthereumAddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field='address'
    
    def update(self,request, *args, **kwargs):
        print(f"Received update request for address: {kwargs['address']} by user {request.user}")

        try:
            #attempt to retrieve the Ethereum address instance associated with the provided address
            instance = self.get_object()
            print(f"Found instance for address: {instance.address}")
            #prepare the serializer with the updated data (setting 'has_voted' to True
            serializer = self.get_serializer(instance, data={'has_voted': True}, partial=True)
            
            if serializer.is_valid():
                #if the data is valid, update the 'has_voted' status
                self.perform_update(serializer)
                #refresh the instance from the database to ensure it reflects the latest state
                instance.refresh_from_db()
                print(f"Updated has_voted for address: {instance.address} to True")
                return Response({'message': "Ethereum Address updated successfully", 'data':serializer.data}, status=status.HTTP_200_OK)
            else:
                return Response({'message': "failed", 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': "failed", 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_update(self, serializer):
        serializer.save()
    
class BlockchainInfoListView(generics.ListAPIView):
    queryset = BlockchainInfo.objects.all()
    serializer_class = BlockchainInfoSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def address_has_voted(request, address):
    #this view returns the 'has_voted' status of the Ethereum address provided in the request
    #used to check if a specific Ethereum address has already voted
    try:
        eth_address = EthereumAddress.objects.get(address=address)
        return Response({'has_voted': eth_address.has_voted})
    except ObjectDoesNotExist:
        return Response({'error': f'Address {address} not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_registered_address_status(request):
    #this view returns whether the user has already registered an Ethereum address 
    user = request.user
    return Response({'has_registered_ethereum_address': user.has_registered_ethereum_address})