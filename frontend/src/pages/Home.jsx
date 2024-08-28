import { useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Header from '../components/Header'
import Countdown from '../components/Countdown'
import LoadingSpinner from '../components/LoadingSpinner'
import '../styles.css'



function Home() {
    const [metamaskAccount, setMetamaskAccount] = useState(null)
    const [electionTime, setElectionTime] = useState(null)
    const [loading, setLoading] = useState(true)
    const [countdownCompleted, setCountdownCompleted] = useState(false)
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    const navigate = useNavigate()

    useEffect(() => {
        fetchElectionTime()
    }, [])

    const fetchElectionTime = async () => {
        setLoading(true)
        try {
            const res = await api.get('api/election-time/')
            setElectionTime(res.data[0])
        } catch (error) {
            console.error('Error fetching election time', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVoteClick = () => {
        if (!metamaskAccount){
            alert("Please connect to MetaMask first")
        } else {
            navigate('/vote')
        }
    }

    if (!electionTime) {
        return <LoadingSpinner/>
    }

    const currentTime = new Date().valueOf()
    const startTime = new Date(electionTime.start_time)
    const endTime = new Date(electionTime.end_time)

    return (
        <div className="container" >
            {loading && <LoadingSpinner/>}
            <Header type={'home'} metamaskAccount={metamaskAccount} setMetamaskAccount={setMetamaskAccount}></Header>
            <main className='home-container'>
                <h2 className="title">Welcome to the Election</h2>
                <div className='dates'>
                    <div className="date-box">
                        <p>Election starts on:</p>
                        <p className="date">{startTime.getDate()}. {monthNames[startTime.getMonth()]} at {startTime.toLocaleTimeString(undefined,{timeStyle:'short'})}</p>
                    </div>
                    <div className="date-box">
                        <p>Election ends on:</p>
                        <p className="date">{endTime.getDate()}. {monthNames[endTime.getMonth()]} at {endTime.toLocaleTimeString(undefined,{timeStyle:'short'})}</p>
                    </div>
                </div>
                {
                currentTime < startTime ? (
                    <div className='election-status-box'>
                        <h3>Time Remaining</h3>
                        <Countdown targetTime={startTime} onComplete={() => setCountdownCompleted()}/>
                    </div>
                ) : currentTime > endTime ? (
                    <div className='election-status-box'>
                        <h3>The voting period ended!</h3>
                    </div>
                ) : (
                    <div className='election-status-box'>
                        <h3>The Election is currently ongoing</h3>
                        <button className='vote-button' onClick={handleVoteClick}>Vote</button>
                        <button className='result-button' onClick={()=>navigate('/election-results')}>Election Results</button>
                        
                    </div>
                )
                }
            </main>
            
        </div>
    )

}

export default Home