import { useEffect, useState} from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api'
import VotingForm from '../components/VotingForm'


function Home() {
    const [metamaskInstalled, setMetamaskInstalled] = useState(false)
    const [electionTime, setElectionTime] = useState(null)
    const [loadingCheckMetamask, setLoadingCheckMetamask] = useState(null)
    const [loadingFetchData, setLoadingFetchData] = useState(true)

    useEffect(() => {
        checkMetamaskInstalled()
        fetchElectionTime()
    }, [])

    const checkMetamaskInstalled = () => {
        setLoadingCheckMetamask(true)
        try{
            if(window.ethereum && window.ethereum.isMetaMask){
                setMetamaskInstalled(true)
            }else{
                setMetamaskInstalled(false)
            }
        }catch (error) {
            setMetamaskInstalled(false)
        } finally {
            setLoadingCheckMetamask(false)
        }
    }

    const fetchElectionTime = async () => {
        setLoadingFetchData(true)
        try {
            const res = await api.get('api/election-time/')
            setElectionTime(res.data[0])
        } catch (error) {
            console.error('Error fetching election time', error)
        } finally {
            setLoadingFetchData(false)
        }
    }

    if (loadingCheckMetamask || loadingFetchData) {
        return <div>Loading...</div>
    }

    if (!metamaskInstalled){
        return <div>
            <p>Metamsk is not installed. Please install Metamask to participate in the election.</p>
            <a className="metamsk-link" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Install Metamask</a>
        </div>
    }

    if (!electionTime) {
        return <div>Could not fetch election times. Please try again later.</div>;
    
    }

    const currentTime = new Date().valueOf()
    const startTime = new Date(electionTime.start_time)
    const endTime = new Date(electionTime.end_time)

    if (currentTime >= startTime && currentTime <= endTime){
        return < Navigate to='/vote' />
    } else {
        if (currentTime < startTime){
            return <div>
                <p>The Election has not started yet.</p>
                <p>It will begin on {startTime.toDateString()} and end on {endTime.toDateString()}</p>
            </div>
        }else{
            return <div>
                <p>The voting period ended on {endTime.toDateString()}</p>
            </div>
        }
    }
}

export default Home