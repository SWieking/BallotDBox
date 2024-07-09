import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import api from "../api"
import ConnectButton from './ConnectButton'
import LogoutButton from './LogoutButton'
import LoadingSpinner from './LoadingSpinner'
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
        fetchData()
    }, [])

    const fetchData = async () => {
        setFetchLoading(true)
        try{
            const candidates = await api.get('api/candidates/')
            const blockchainInfo = await api.get('api/blockchain/info/')
            setCandidates(candidates.data)
            setAbi(blockchainInfo.data[0].abi)
            setContractAddress(blockchainInfo.data[0].contract_address)
        } catch (e) {
            setError({'message': 'Failed to fetch Data.', 'code':0})
        } finally {
            setFetchLoading(false)
        }
    }

    const handleVoteClick = () => {
        if (selectedCandidate) {
            setShowConfirmation(true)
        } else {
            setError({'message': 'Please select a candidate before voting.', 'code': 0})
        }
    }
    
    const handleConfirmVote = async (e) => {
        setLoading(true)
        e.preventDefault()

        try{
            const contract = new ethers.Contract(contractAddress, abi, signer)
            const tx = await contract.vote(selectedCandidate.blockchain_id)
            const receipt = await tx.wait()
            if(receipt && receipt.status === 1){
                console.log(receipt.status)
                const res = await api.patch(`api/blockchain/set-address-voted/${userAddress}/`)
                console.log(res)
                setError(null)
                setVotingSuccessful(true)
                return <p>Your Vote was successful.</p>
            } else {
                setError({'message':'Voting was unsuccessful!','code':1})
            }
        } catch (e) {
            if(e.code){
                if(e.reason && e.code === 'CALL_EXCEPTION' && e.reason === 'require(false)'){
                    setError({'message':'You have already voted with this address.', 'code':0})
                }else if(e.code === 'ACTION_REJECTED'){
                    setError({'message': 'You denied the transaction. Please try again and confirm the transaction in MetaMask.', 'code': 0})
                } else if (e.code === 'INSUFFICIENT_FUNDS') {
                    setError({'message': 'You have insufficient funds to complete this transaction.', 'code': 0});
                } else if (e.code === 'NETWORK_ERROR') {
                    setError({'message': 'A network error occurred. Please check your connection and try again.', 'code': 0});
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
        return <LoadingSpinner></LoadingSpinner>
    }

    if(error && error.code === 0){
        return <p>{error.message}</p>
    }

    return (
        <div className='container'>
            {loading && <LoadingSpinner></LoadingSpinner>}
            <header>
                <h1>Public Voting Administration</h1>
                <ConnectButton metamaskAccount={metamaskAccount} setMetamaskAccount={setMetamaskAccount}></ConnectButton>
                <LogoutButton></LogoutButton>
            </header>
            <main>
                <h2 className='title'>Voting</h2>
                {error && error.code === 1 && <p className='error'>{error}</p>}
                {showConfirmation ? (
                    <div>
                        <p>Are you sure you want to vote for {selectedCandidate.name}?</p>
                        <button onClick={() => setShowConfirmation(false)}> Change Candidate</button>
                        <button onClick={handleConfirmVote}>Confrim Vote</button>
                    </div>
                ) : votingSuccessful ? (
                    <div>
                        <p>Your Vote was successful.</p>
                    </div>
                ) : (
                <form onSubmit={handleVoteClick} className='voting-form-container'>
                    {candidates.map(candidate => 
                        <label key={candidate.id} className='candidate-box'>
                            <div className='candidate-label'>
                                {candidate.name}
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
                    <button type='submit'>Voting</button>
                </form>
                )}
            </main>
        </div>
    )


}

export default VotingForm