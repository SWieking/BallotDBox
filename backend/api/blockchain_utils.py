from web3 import Web3
from django.conf import settings
import os
import json


server_address = settings.BC_SERVER_ADDRESS
contract_address = settings.BC_CONTRACT_ADDRESS
abi_path = settings.BC_ABI_PATH
owner_pk = settings.BC_OWNER_PK

w3 = Web3(Web3.HTTPProvider(server_address))
owner_account = w3.eth.account.from_key(owner_pk)
w3.eth.defaultAccount = owner_account.address

contract_instance = w3.eth.contract(address=contract_address)


def load_contract():
    with open(abi_path,'r') as file:
        abi = json.load(file)['abi']

    return w3.eth.contract(address=contract_address, abi=abi)

def handle_transaction(tx_hash):
    receipt = Web3.eth.waitForTransactionReceipt(tx_hash)
    if receipt.status == 1:
        return "succes"
    else:
        return "blockchain transaction failed"
    
def add_candidate_to_blockchain(candidate_id,name, party):
    try:
        contract = load_contract()
        tx_hash = contract.functions.addCandidate(candidate_id,name, party).transact()
        return handle_transaction(tx_hash)
    except Exception as e:
        return f"failed with Exception {e}"
    
def update_candidate_on_blockchain(candidate_id, name, party):
    try:
        contract = load_contract()
        tx_hash = contract.functions.updateCandidate(candidate_id, name, party).transact()
        return handle_transaction(tx_hash)
    except Exception as e:
        return f"failed with Exception {e}"
    
def delete_candidate_from_blockchain(candidate_id):
    try:
        contract = load_contract()
        tx_hash = contract.functions.deleteCandidate(candidate_id).transact()
        return handle_transaction(tx_hash)
    except Exception as e:
        return f"failed with Exception {e}"
    
def add_etherum_address_to_blockchain(address):
    try:
        contract = load_contract()
        tx_hash = contract.functions.addEligibleVoter(address).transact()
        return handle_transaction(tx_hash)
    except Exception as e:
        return f"failed with Exception {e}"
    
def setElectionTime(start_time, end_time):
    try:
        contract = load_contract()
        tx_hash = contract.functions.setElectionTime(start_time, end_time).transact()
        return handle_transaction(tx_hash)
    except Exception as e:
        return f"failed with Exception {e}"

    

    


