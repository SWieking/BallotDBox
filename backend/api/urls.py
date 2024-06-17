from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'admin-eligible-voter', views.EligibleVoterAdminView, basename='eligible-voter')
router.register(r'admin-candidates', views.CandidateAdminView)
router.register(r'admin-election-time', views.ElectionTimeAdminView)

urlpatterns = [
    path('', include(router.urls)),
    path('candidates/', views.CandidateListView.as_view(), name='candidates'),
    path('election-time/', views.ElectionTimeListView.as_view(), name="election-time"),
    path('blockchain/add-ethereum-address/', views.AddEthereumAddressView.as_view(), name='add-ethereum-address'),
    path('user/registered-address-status/', views.user_registered_address_status, name='user-registered-address-status'),
    path('blockchain/get-address-voted/<str:address>/', views.address_has_voted, name='get-address-voted'),
    path('blockchain/set-address-voted/<str:address>/',views.EthereumAddressVoteUpdateView.as_view(), name='set-address-voted'),
    path('blockchain/info/', views.BlockchainInfoListView.as_view(), name='blockchain-info')
]