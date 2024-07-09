import { useState, useEffect } from "react"

const ConnectButton = ({metamaskAccount, setMetamaskAccount}) => {

    useEffect(() => {

        if (window.ethereum) {
            
            window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
                if (accounts.length > 0) {
                    setMetamaskAccount(accounts[0]);
                }
            })
            
            window.ethereum.on('accountsChanged', accounts => {
                if(accounts.length >0){
                    setMetamaskAccount(accounts[0])
                }else{
                    setMetamaskAccount(null)
                }
            })
        }

    },[])


    const handleConnect = async () => {
        if (!window.ethereum){
            return <div>
                <p>Metamsk is not installed. Please install Metamask to participate in the election.</p>
                <a className="metamsk-link" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Install Metamask</a>
            </div>
        } else {
            try{
                const accounts = await window.ethereum.request({method: "eth_requestAccounts"})
                setMetamaskAccount(accounts[0])
                setMetamaskConnected(true)  
            } catch(e) {
                if(e.code === -32002){
                    alert("A request to connect to MetaMask is already pending. Please check MetaMask.")
                } else if (e.code === 4001){
                    setError("Connection to MetaMask was rejected by the user.")
                } else {
                    console.error("MetaMask connection error", e);
                }
            }  
        }      
    }

    return (
        <div>
            {metamaskAccount ? (
                <div>
                    <button disabled>{metamaskAccount.substr(0,5)}...{metamaskAccount.substr(-5)}</button>
                </div>
            ) : (
                <button onClick={handleConnect}>Connect to MetaMask</button>
            )}
        </div>
    );
}

export default ConnectButton;
