const fs = require('fs');

async function main() {
    // Setup accounts & variables
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contract with the account:", deployer.address)
    
    //Deploy contract
    const BallotBox = await ethers.getContractFactory("BallotBox")
    const ballotBox = await BallotBox.deploy()
    await ballotBox.waitForDeployment()
    if(process.env.DOCKER === 'true'){
        fs.writeFileSync('deployment_successful.flag','')
        console.log('deployment_successful.flag created')
    }
    console.log(`Deployed Ballotbox Contract at: ${await ballotBox.getAddress()}\n`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})