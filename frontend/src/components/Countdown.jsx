import React, {useEffect, useState} from 'react'

function Countdown({targetTime, onComplete}) {
    
    //initialize time left until target time
    const [timeLeft, setTimeLeft] = useState(targetTime - new Date().valueOf()) 

    useEffect(() => {
        const interval = setInterval(() => {
            const remainingTime = targetTime - new Date().valueOf()
            setTimeLeft(remainingTime)
            //stop the interval when countdown is complete
            if(remainingTime <= 0){
                clearInterval(interval)
                onComplete()
            }
        }, 1000)
        //cleanup interval on component unmount
        return () => clearInterval(interval)
    },[])

    const formatTimeLeft = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const days = Math.floor(totalSeconds / 86400);

        const times = [
            {value: days, label:'Days'},
            {value: hours, label:'Hours'},
            {value: minutes, label:'Minutes'},
            {value: seconds, label: 'Seconds'}
        ]

        return times

    };

    const times = formatTimeLeft(timeLeft)
    console.log(times)

    //find the first non-zero time unit
    const firstNoneZeroIndex = times.findIndex((time) => time.value > 0)
    
    return (
        <div className='countdown-times'>
            {times.map((time, i) => {
                if (i>=firstNoneZeroIndex && firstNoneZeroIndex >= 0){
                    return(
                        <div key= {i} className='countdown-time'>
                            <div className='countdown-v-l'>
                                <p className = 'countdown-value'>{String(time.value).padStart(2,'0')}</p>
                                <p className = 'countdown-label'>{time.label}</p>
                            </div>
                            {i<times.length - 1 && (<span className='countdown-colon'>:</span>)}
                        </div>
                    )
                }else{
                    return null
                }
            })}
        </div>
       
    )
        
    
}

export default Countdown
