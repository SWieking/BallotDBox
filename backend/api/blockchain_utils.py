"""
This module provides utility functions for the backend to interact with the Ethereum blockchain,
specifically targeting the BallotBox smart contract. It includes functions for loading the contract,
checking its deployment status and executing transactions related to candidate and voter management,
as well as setting election times.
"""

from web3 import Web3
from django.conf import settings
import os
import json

#node URL and contract details from Django settings
node_url = settings.ETH_NODE_URL
contract_address = settings.SMART_CONTRACT_ADDRESS
abi_path = settings.SMART_CONTRACT_ABI_PATH
owner_pk = settings.CONTRACT_OWNER_PK

#initialize Web3 instance and set owner's account
w3 = Web3(Web3.HTTPProvider(node_url))
owner_account = w3.eth.account.from_key(owner_pk)
w3.eth.defaultAccount = owner_account.address

#initialize contract instance with address
contract_instance = w3.eth.contract(address=contract_address)

#load contract ABI and create contract instance
def load_contract():
    with open(abi_path,'r') as file:
        abi = json.load(file)['abi']
    return w3.eth.contract(address=contract_address, abi=abi)

def check_contract_deployed(contract):
    #check if the contract is deployed by calling 'isDeployed' on the contract
    if contract.functions.isDeployed().call() == 1:
        return True
    else:
        return False
    
def handle_transaction(function_name, *args):
    try:
        contract = load_contract()
        if check_contract_deployed(contract):
            #dynamically call the function specified by 'function_name' with provided arguments
            tx_hash = getattr(contract.functions , function_name)(*args).transact()
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            #check transaction receipt to determine if the transaction was successful
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