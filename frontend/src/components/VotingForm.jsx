import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import api from "../api"
import ConnectButton from './ConnectButton'
import "../styles.css"


function VotingForm({signer, userAddress}) {

    const [candidates, setCandidates] = useState(null)
    const [abi, setAbi] = useState(null)
    const [contractAddress, setContractAddress] = useState('')
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const [votingSuccessful, setVotingSuccessful] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [metamaskAccount, setMetamaskAccount] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try{
            const candidates = await api.get('api/candidates/')
            const blockchainInfo = await api.get('api/blockchain/info/')
            setCandidates(candidates.data)
            setAbi(blockchainInfo.data[0].abi)
            setContractAddress(blockchainInfo.data[0].contract_address)
        } catch (e) {
            setError({'message': 'Failed to fetch Data.', 'code':0})
        } finally {
            setLoading(false)
        }
    }
    
    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()

        try{
            const contract = new ethers.Contract(contractAddress, abi, signer)
            console.log(selectedCandidate)
            const tx = await contract.vote(selectedCandidate.blockchain_id)
            const receipt = await tx.wait()
            console.log(receipt.status)
            if(receipt && receipt.status === 1){
                const res = await api.patch(`api/blockchain/set-address-voted/${userAddress}/`)
                setError(null)
                setVotingSuccessful(true)
                return <p>Your Vote was successful.</p>
            } else {
                setError({'message':'Voting was unsuccessful!','code':1})
            }
        } catch (e) {
            console.dir(e)
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
                console.log(e)
                setError({'message': e.message || 'An unknown error occurred', 'code':0})
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading){
        return <div>Loading...</div>
    }

    if(error && error.code === 0){
        return <p>{error.message}</p>
    }

    if(votingSuccessful){
        return <p>Your Vote was successful.</p>
    }

    return (
        <div className='container form-container'>
            <header>
                <h1>Public Voting Administration</h1>
                <ConnectButton metamaskAccount={metamaskAccount} setMetamaskAccount={setMetamaskAccount}></ConnectButton>
            </header>
            <h1>Voting</h1>
            {error && error.code === 1 && <p className='error'>{error}</p>}
            <form onSubmit={handleSubmit} className='form-container'>
                {candidates.map(candidate => 
                    <div key={candidate.id}>
                        <label>
                            {candidate.name}
                            <input
                                name={'candidate'}
                                type='radio'
                                checked={selectedCandidate?.id === candidate.id}
                                onChange={() => setSelectedCandidate(candidate)}
                            />
                        </label>
                    </div>
                )}
                <button type='submit'>Voting</button>
            </form>
        </div>
    )


}

export default VotingForm