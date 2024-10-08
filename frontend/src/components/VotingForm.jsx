import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import api from "../api"
import ConnectButton from './ConnectButton'
import LogoutButton from './LogoutButton'
import LoadingSpinner from './LoadingSpinner'
import Header from "./Header"
import "../styles.css"


function VotingForm({signer, userAddress}) {

    const [candidates, setCandidates] = useState(null)
    const [abi, setAbi] = useState(null)
    const [contractAddress, setContractAddress] = useState('')
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [votingSuccessful, setVotingSuccessful] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [metamaskAccount, setMetamaskAccount] = useState(null)

    useEffect(() => {
        //fetch candidates and blockchain contract data on component mount
        fetchData()
    }, [])

    const fetchData = async () => {
        setFetchLoading(true)
        try{
            const candidates = await api.get('api/candidates/')
            const blockchainInfo = await api.get('api/blockchain/info/')
            setAbi(blockchainInfo.data[0].abi)
            //set the ABI for the smart contract
            setCandidates(candidates.data)
            //set the contract address for the smart contract
            setContractAddress(blockchainInfo.data[0].contract_address)
        } catch (e) {
            setError({'message': 'Failed to fetch Data.', 'code':0})
        } finally {
            setFetchLoading(false)
        }
    }

    const handleVoteClick = (e) => {
        e.preventDefault()

        //show confirmation prompt if a candidate was selected, set error if no candidate is selected
        if (selectedCandidate) {
            setShowConfirmation(true)
        } else {
            setError({'message': 'Please select a candidate before voting.', 'code': 1})
        }
    }
    
    const handleConfirmVote = async (e) => {
        setLoading(true)
        e.preventDefault()

        try{
            //initialize contract instance
            const contract = new ethers.Contract(contractAddress, abi, signer)
            //initiate voting transaction
            const tx = await contract.vote(selectedCandidate.blockchain_id)
            //wait for the transaction to be mined
            const receipt = await tx.wait()
            if(receipt && receipt.status === 1){
                //update backend that user has voted
                const res = await api.patch(`api/blockchain/set-address-voted/${userAddress}/`)
                setError(null)
                setVotingSuccessful(true)
            } else {
                setError({'message':'Voting was unsuccessful!','code':1})
            }
        } catch (e) {
            //handle various Ethereum errors based on the error code
            if(e.code){
                if(e.reason && e.code === 'CALL_EXCEPTION' && e.reason === 'require(false)'){
                    setError({'message':'You have already voted with this address.', 'code':1})
                }else if(e.code === 'ACTION_REJECTED'){
                    setError({'message': 'You denied the transaction. Please try again and confirm the transaction in MetaMask.', 'code': 1})
                } else if (e.code === 'INSUFFICIENT_FUNDS') {
                    setError({'message': 'You have insufficient funds to complete this transaction.', 'code': 1});
                } else if (e.code === 'NETWORK_ERROR') {
                    setError({'message': 'A network error occurred. Please check your connection and try again.', 'code': 1});
                } else {
                    setError({'message': e.message || 'An unknown error occurred', 'code':0})
                }
            } else {
                setError({'message': e.message || 'An unknown error occurred', 'code':0})
            }
        } finally {
            setLoading(false)
            setShowConfirmation(false)
        }
    }

    if(fetchLoading){
        return <LoadingSpinner/>
    }

    if(error && error.code === 0){
        return(
                <div className="container">
                    <div className='error-message'>{error.message}</div>
                </div>)
    }

    return (
        <div className='container'>
            {loading && <LoadingSpinner/>}
            <Header type={'vote'} metamaskAccount={metamaskAccount} setMetamaskAccount={setMetamaskAccount}></Header>
            <main>
                <h2 className='title'>Voting</h2>
                {showConfirmation ? (
                    <div>
                        <p>Are you sure you want to vote for <b>{selectedCandidate.name}</b></p>
                        <button onClick={() => setShowConfirmation(false)}> Change Candidate</button>
                        <button onClick={handleConfirmVote}>Confirm Vote</button>
                    </div>
                ) : votingSuccessful ? (
                    <div>
                        <p>Your Vote was successful.</p>
                    </div>
                ) : (
                <div>
                    {error && error.code === 1 && <div className='error-message'>{error.message}</div>}
                    <form onSubmit={handleVoteClick} className='voting-form-container'>
                        {candidates.map(candidate => 
                            <label key={candidate.id} className='candidate-box'>
                                <div className='candidate-label'>
                                    <p>Name: {candidate.name}</p>
                                    <p>Party: {candidate.party}</p>
                                    <p>Age: {candidate.age}</p>
                                </div>
                                <input 
                                    className='candidate-input'
                                    name={'candidate'}
                                    type='radio'
                                    checked={selectedCandidate?.id === candidate.id}
                                    onChange={() => setSelectedCandidate(candidate)}
                                />
                                
                            </label>
                        )}
                        <button className='submit-vote-button' type='submit'>Submit Your Vote</button>
                    </form>
                </div>
                )}
            </main>
        </div>
    )
}

export default VotingForm