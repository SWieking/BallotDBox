import { useNavigate } from "react-router-dom"
import ConnectButton from "./ConnectButton"
import LogoutButton from "./LogoutButton"

function Header({type, metamaskAccount, setMetamaskAccount}){
    const navigate = useNavigate()

    if(type==='login' || type==='register'){
        return(
            <header>
                <div className='header-left'>
                    <button>Home</button>
                    <h1>Public Voting Administration</h1>
                </div>
                <div className='header-right'>
                    {type === 'login' ? (<button onClick={() => navigate('/register')}>Register</button>)
                    : (<button onClick={() => navigate('/login')}>Login</button>)}
                    
                </div>
            </header>
        )
    } else {
        return(
            <header>
                <div className='header-left'>
                    <button onClick={() => navigate('/')}>Home</button>
                    <h1>Public Voting Administration</h1>
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
