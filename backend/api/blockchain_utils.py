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

def check_contract_deployed(contract):
    if contract.functions.isDeployed().call() == 1:
        return True
    else:
        return False
    
def handle_transaction(function_name, *args):
    try:
        contract = load_contract()
        if check_contract_deployed(contract):
            tx_hash = getattr(contract.functions , function_name)(*args).transact()
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            if receipt.status == 1:
                return "success"
            else:
                return "blockchain transaction failed"
        else:
            return "contract does not exist"
    except Exception as e:
        return f"failed with Exception {e}"

    
def add_candidate_to_blockchain(candidate_id,name, party):
    return handle_transaction("addCandidate",candidate_id, name, party)
         
def update_candidate_on_blockchain(candidate_id, name, party):
    return handle_transaction("updateCandidate", candidate_id, name, party)
    
def delete_candidate_from_blockchain(candidate_id):
    return handle_transaction("deleteCandidate", candidate_id)
    
def add_etherum_address_to_blockchain(address):
    return handle_transaction("addEligibleVoter", address)
    
def setElectionTime(start_time, end_time):
    return handle_transaction("setElectionTime", start_time, end_time)

    

    


