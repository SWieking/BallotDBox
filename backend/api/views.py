from django.shortcuts import render
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from .serializers import CostumUserSerializer, AdminEligibleVotersSerializer, EthereumAddressSerializer
from .models import CostumUser, EligibleVoter, EthereumAddress

class CreatCostumUserView(generics.CreateAPIView):

    queryset = get_user_model().all()
    serializer_class = CostumUserSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):

        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        id_number = request.data.get('id_number')
        id_pin = request.data.get('id_pin')

        try:
            eligible_voter = EligibleVoter.objects.get(id_number=id_number, first_name=first_name, last_name=last_name)
            if check_password(id_pin, eligible_voter.id_pin_hash):
                return super().post(request, *args, **kwargs)
            else:
                return Response({'error': 'Verification failed'}, status = status.HTTP_400_BAD_REQUEST)
        except EligibleVoter.DoesNotExist:
            return Response({'error': 'Verification failed'}, status=status.HTTP_404_NOT_FOUND)
        
class EligibleVoterAdminView(viewsets.ModelViewSet):
    queryset = EligibleVoter.objects.all()
    serializer_class = AdminEligibleVotersSerializer
    permission_classes = [permissions.IsAdminUser]

class AddEtherumAddressView(generics.CreateAPIView):
    queryset = EthereumAddress.objects.all()
    serializer_class = EthereumAddressSerializer
    permission_classes = [permissions.IsAuthenticated]