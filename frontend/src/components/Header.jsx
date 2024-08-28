import { useNavigate } from "react-router-dom"
import ConnectButton from "./ConnectButton"
import LogoutButton from "./LogoutButton"
import HomeButton from "./HomeButton"

function Header({type, metamaskAccount = null, setMetamaskAccount = null}){
    const navigate = useNavigate()


    if(type==='login' || type==='register'){
        return(
            <header>
                <div className='header-left'>
                    <HomeButton/>
                    <h1>BallotDBox</h1>
                </div>
                <div className='header-right'>
                    {type === 'login' ? (<button onClick={() => navigate('/register')}>Register</button>)
                    : (<button onClick={() => navigate('/login')}>Login</button>)}
                    
                </div>
            </header>
        )
    }else if (type==='results'){
        return(
            <header>
                <div className='header-left'>
                    <HomeButton/>
                    <h1>BallotDBox</h1>
                </div>
                <div className='header-right'>
                    <div className='header-buttons'>
                        <LogoutButton></LogoutButton>
                    </div>
                </div>
            </header>
        )
    } else {
        return(
            <header>
                <div className='header-left'>
                    <HomeButton/>
                    <h1>BallotDBox</h1>
                </div>
                <div className='header-right'>
                    <div className='header-buttons'>
                        <ConnectButton metamaskAccount={metamaskAccount} setMetamaskAccount={setMetamaskAccount}></ConnectButton>
                        <LogoutButton></LogoutButton>
                    </div>
                </div>
            </header>
        )
    }
}

export default Header
