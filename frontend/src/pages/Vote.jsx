import { useEffect, useState } from "react"
import api from '../api'
import VotingForm from '../components/VotingForm'
import { ethers } from 'ethers'

const Vote = () => {
    const [hasRegisteredEthereumAddress, setHasRegisteredEthereumAddress] = useState(false)
    const [ethereumAddressConfirmed, setEthereumAddressConfirmed] = useState(false)
    const [ethereumSigner, setEthereumSigner] = useState(null)
    const [ethereumAddress, setEthereumAddress] = useState('')
    const [loadingFetchAddressStatus, setLoadingFetchAddressStatus] = useState(true)
    const [loadingFetchSigner, setLoadingFetchSigner] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchUserAddressStatus()
        fetchEthereumSignerAndAddress()
    }, [])

    const fetchUserAddressStatus = async () => {
        setLoadingFetchAddressStatus(true)
        try {
            const response = await api.get('api/user/registered-address-status/')
            setHasRegisteredEthereumAddress(response.data.has_registered_ethereum_address)
        } catch (e){
            setError('Could not fetch address status')
        } finally {
            setLoadingFetchAddressStatus(false)
        }
    }

    const fetchEthereumSignerAndAddress = async () => {
        setLoadingFetchSigner(true)
        try{
            if(window.ethereum){
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const address = await signer.getAddress()
                setEthereumSigner(signer)
                setEthereumAddress(address)
            }else{
                setError("Please install Metamask!")
            }
        } catch (e) {
            if(e.error){
                if (e.error.code === -32002) {
                    setError("A request to connect to Metamask is already pending. Please check Metamask.");
                } else {
                    setError(e.error.name)
                }
            } else {
                setError(e.message)
            }
        } finally {
            setLoadingFetchSigner(false)
        }
    }

    const registerAddress = async () => {
        try{                     
            const response = await api.post('api/blockchain/add-ethereum-address/', {address: ethereumAddress})
            if(response.status === 201){
                setEthereumAddressConfirmed(true)
            } else {
                setError('Failed to register Address')
            }
        } catch (e){
            setError('Could not confirm Ethereum address. Please try again later.')
        }
    }

    const check_address_has_voted = async () => {
        try{
            const response = await api.get(`api/blockchain/get-address-voted/${ethereumAddress}/`)
            const hasVoted = response.data.has_voted
            console.log(hasVoted)
            if(hasVoted){
                setError(`You already voted with the address: ${ethereumAddress}`)
            }
        } catch (e){
            if(e.response && e.response.status === 404){
                setError('The current address is not registered. Please ensure you have registered this address.')
            } else {
                console.log(e)
                setError(e.message)
            }
        }
    }

    if (loadingFetchAddressStatus || loadingFetchSigner)  {
        return <div>Loading...</div>
    }

    if (error) {
        if (error === "Please install Metamask!") {
            return (
                <div>
                    <p> Please <a className="metamask-link" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">install Metamask</a>
                    </p>
                </div>
            )
        }
        return <div>{error}</div>
    }

    if(ethereumAddressConfirmed){
        check_address_has_voted()
    } else {
        if(hasRegisteredEthereumAddress){
            return <div>
                <p>You have already registered an Ethereum address for voting.</p>
                <p>Your current Ethereum address is: {ethereumAddress}</p>
                <p>Is this the address you already registered?</p>
                <button onClick={() => setEthereumAddressConfirmed(true)}>Yes, confirm</button>
            </div>
        } else {
            return <div>
                <p>Your current Ethereum address is: {ethereumAddress}</p>
                <p>Is this the address you want to use for voting? This action cannot be undone.</p>
                <button onClick={registerAddress}> Yes, confirm</button>
            </div>
        }
    }
    return <VotingForm signer={ethereumSigner} userAddress={ethereumAddress} />
}

export default Vote