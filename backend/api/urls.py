from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'admin-eligible-voter', views.EligibleVoterAdminView, basename='eligible-voter')
router.register(r'admin-candidates', views.CandidateAdminView)
router.register(r'admin-election-time', views.ElectionTimeAdminView)

urlpatterns = [
    path('', include(router.urls)),
    path('add-ethereum-address', views.AddEtherumAddressView.as_view() , name="add-ethereum-address"),
    path('candidates', views.CandidateReadOnlyView.as_view(), name='candidates'),
    path('election-time', views.ElectionTimeReadOnlyView.as_view(), name="election-time")
]