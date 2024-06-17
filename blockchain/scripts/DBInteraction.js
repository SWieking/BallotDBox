const { ethers } = require("hardhat")

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  
  console.log("Connecting to contract:", contractAddress)
  
  try {
    const BallotBox = await ethers.getContractFactory("BallotBox")
    const ballotBox = BallotBox.attach(contractAddress)

    const code = await ethers.provider.getCode(contractAddress)
    if (code === "0x") {
      throw new Error("Contract does not exist at the specified address.")
    }
    console.log("Candidates details:")
    for (let id = 1; id <= 3; id++) {
      try {
        let candidate = await ballotBox.candidates(id)
        console.log(candidate)
        console.log(`ID: ${id}`)
        console.log(`Name: ${candidate.name}`)
        console.log(`Party: ${candidate.party}`)
        console.log(`Votes: ${candidate.voteCount.toString()}`)
        console.log("---------------------")
      } catch (error) {
        console.error(`Failed to get candidate data for ID ${id}`, error)
      }
    }

    const eligibleVoter = await ballotBox.votersStatus('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC')
    console.log(eligibleVoter)

    const startTime = await ballotBox.startTime()
    const endTime = await ballotBox.endTime()
    console.log(`Starttime: ${startTime}, Endtime: ${endTime}`)
  } catch (error) {
    console.error("Error interacting with contract:", error)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Failed to execute script:", error)
    process.exit(1)
  });
