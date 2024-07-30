from django.contrib import admin

from api.models import CustomUser, EligibleVoter, Candidate, ElectionTime, BlockchainInfo

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username','has_registered_ethereum_address')
    search_field = ('username')
    filter = ('has_registered_ethereum_address')

@admin.register(EligibleVoter)
class EligibleVoterAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name')
    search_fields = ('first_name', 'last_name')

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('name', 'party')
    search_fields = ('name', 'party')
    list_filter = ('party',)

@admin.register(ElectionTime)
class ElectionTimeAdmin(admin.ModelAdmin):
    pass

@admin.register(BlockchainInfo)
class BlockchainInfoAdmin(admin.ModelAdmin):
    pass
