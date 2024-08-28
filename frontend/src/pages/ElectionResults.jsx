import { useEffect, useState} from 'react'
import { ethers } from "ethers";
import api from '../api'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles.css'


const ElectionResults = () => {
    const [candidates, setCandidates] = useState([])
    const [contract, setContract] = useState(null)
    const [loading, setLoading] = useState(false)
    const [votesLoading, setVotesLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        fetchCandidatesAndContract()
    },[])

    const fetchCandidatesAndContract = async () => {
        setLoading(true)
        try{
            const candidatesRes = await api.get('api/candidates/')
            const candidates =  candidatesRes.data
            
            const blockchainInfo = await api.get('api/blockchain/info/')
            const abi = (blockchainInfo.data[0].abi)
            const contractAddress = blockchainInfo.data[0].contract_address

            const provider = new ethers.BrowserProvider(window.ethereum)
            const contract = new ethers.Contract(contractAddress, abi, provider)

            setContract(contract)
            setCandidates(candidates)

            fetchVotes(contract, candidates)

        } catch (e) {
            console.log(e)
            setError('Failed to fetch Data.')
        } finally {
            setLoading(false)
        }
    }

    const fetchVotes = async (contract, candidates) => {
        setVotesLoading(true)
        try{
            const updatedCandidates = await Promise.all(
                candidates.map(async (candidate) => {
                    const voteCount = await contract.getVoteCount(candidate.blockchain_id)
                    return {...candidate, voteCount: Number(voteCount)}
                })
            )
            setCandidates(updatedCandidates)         
        } catch (e) {
            console.error(`Failed to fetch vote count:`, e);
        } finally {
            setVotesLoading(false)
        }
    }

    return(
        <div className='container'>
            {(loading || votesLoading) && <LoadingSpinner/>}
            <Header type='results'></Header>
            <main>
                {error ? (
                    <div className='error-message'>{error}</div>
                ) : (
                    <div className='result-container'> 
                        {candidates.map((candidate) => (
                            <div key={candidate.id} className='candidate-result-box'>
                                <p><strong>Name:</strong> {candidate.name}</p>
                                <p><strong>Party:</strong> {candidate.party}</p>
                                <p><strong>Age:</strong> {candidate.age}</p>
                                <hr/>
                                <p className='vote-count'><strong>Votes:</strong> {candidate.voteCount}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            
        </div>
    )
}

export default ElectionResults