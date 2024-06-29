import { useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Countdown from '../components/Countdown'
import ConnectButton from '../components/ConnectButton'
import '../styles.css'



function Home() {
    const [metamaskConnected, setMetamaskConnected] = useState(false)
    const [metamaskAccount, setMetamaskAccount] = useState(null)
    const [electionTime, setElectionTime] = useState(null)
    const [loadingFetchData, setLoadingFetchData] = useState(true)
    const [countdownCompleted, setCountdownCompleted] = useState(false)
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    const navigate = useNavigate()

    useEffect(() => {
        fetchElectionTime()
    }, [])

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

    const handleVoteClick = () => {
        if (!metamaskAccount){
            alert("Please connect to MetaMask first")
        } else {
            return navigate('/vote')
        }
    }

    if(loadingFetchData){
        return <p>Loading...</p>
    }

    if (!electionTime) {
        return <div>Could not fetch election times. Please try again later.</div>;
    }

    const currentTime = new Date().valueOf()
    const startTime = new Date(electionTime.start_time)
    const endTime = new Date(electionTime.end_time)

    return (
        <div className="container home-container" >
            <header>
                <h1>Public Voting Administration</h1>
                <ConnectButton metamaskAccount={metamaskAccount} setMetamaskAccount={setMetamaskAccount}></ConnectButton>
            </header>
            <main>
                <h2 className="title">Welcome to the Election</h2>
                <div className="time-box">
                    <p>Election starts on:</p>
                    <p className="time">{startTime.getDate()}. {monthNames[startTime.getMonth()]} at {startTime.toLocaleTimeString(undefined,{timeStyle:'short'})}</p>
                </div>
                <div className="time-box">
                    <p>Election ends on:</p>
                    <p className="time">{endTime.getDate()}. {monthNames[endTime.getMonth()]} at {endTime.toLocaleTimeString(undefined,{timeStyle:'short'})}</p>
                </div>
                {
                currentTime < startTime ? (
                    <div>
                        <p>The Election has not started yet.</p>
                        <Countdown targetTime={startTime} onComplete={() => setCountdownCompleted()}/>
                    </div>
                ) : currentTime > endTime ? (
                    <div>
                        <p>The voting period ended!</p>
                    </div>
                ) : (
                    <div>
                        <p>The Election is currently ongoing.</p>
                        <button onClick={handleVoteClick}>Vote</button>
                    </div>
                )
                }
            </main>
            
        </div>
    )

}

export default Home