from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'eligible-voter', views.EligibleVoterAdminView, basename='eligible-voter')

urlpatterns = [
    path('', include(router.urls)),
    path("add-ethereum-address", views.AddEtherumAddressView.as_view() , name="add-ethereum-address"),
]