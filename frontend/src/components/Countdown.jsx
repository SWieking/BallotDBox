import React, {useEffect, useState} from 'react'

function Countdown({targetTime, onComplete}) {
    const [timeLeft, setTimeLeft] = useState(targetTime - new Date().valueOf())

    useEffect(() => {
        const interval = setInterval(() => {
            const remainingTime = targetTime - new Date().valueOf()
            setTimeLeft(remainingTime)
            if(remainingTime <= 0){
                clearInterval(interval)
                onComplete()
            }
        }, 1000)

        return () => clearInterval(interval)
    },[])

    const formatTimeLeft = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const days = Math.floor(totalSeconds / 86400);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };


        return <p>Time left until start: {formatTimeLeft(timeLeft)}</p>;
    
}

export default Countdown
