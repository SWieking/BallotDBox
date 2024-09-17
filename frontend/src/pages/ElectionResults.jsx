import { useEffect, useState} from 'react'
import { ethers } from "ethers";
import api from '../api'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import { Bar } from 'react-chartjs-2' 
import { Chart as ChartJS } from 'chart.js/auto'
import '../styles.css'


const ElectionResults = () => {
    const [candidates, setCandidates] = useState([])
    const [contract, setContract] = useState(null) 
    const [loading, setLoading] = useState(false)
    const [votesLoading, setVotesLoading] = useState(false)
    const [totalVotes, setTotalVotes] = useState(0)
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

            //initialize ethers provider using MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum) 
            //initialize contract instance
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
            //fetch total votes from blockchain
            const totalVotes = await contract.getTotalVotes()

            //iterate over each candidate and add the vote count fetched from the blockchain
            const updatedCandidates = await Promise.all(
                candidates.map(async (candidate) => {
                    const voteCount = await contract.getVoteCount(candidate.blockchain_id)
                    return {...candidate, voteCount: Number(voteCount)}
                })
            ) 

            setTotalVotes(Number(totalVotes)) 
            setCandidates(updatedCandidates)
        } catch (e) {
            console.error(`Failed to fetch vote count:`, e);
        } finally {
            setVotesLoading(false)
        }
    }

    const renderVoteChart = () => {
        const data={
            labels: candidates.map(candidate => candidate.name),
            datasets: [{
                label: 'Votes',
                data: candidates.map(candidate => candidate.voteCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        }
        const options = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        };
        return <Bar data={data} options={options}/>
    }

    return(
        <div className='container'>
            {(loading || votesLoading) && <LoadingSpinner/>}
            <Header type='results'></Header>
            <main>
                {error ? (
                    <div className='error-message'>{error}</div>
                ) : (
                    <div>
                        <p className='total-votes'>Total Votes: {totalVotes}</p>
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
                        <div className='vote-chart-container'>
                            {renderVoteChart()} 
                        </div>
                    </div>
                )}
            </main>
            
        </div>
    )
}

export default ElectionResults