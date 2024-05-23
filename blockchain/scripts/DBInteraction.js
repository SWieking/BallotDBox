const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  

  console.log("Connecting to contract:", contractAddress);
  const BallotBox = await ethers.getContractFactory("BallotBox")
  //const BallotBox = await hre.ethers.getContractAt("BallotBox", contractAddress);
  const ballotBox = BallotBox.attach(contractAddress)

  try {
    //const totalCandidates = await ballotBox.totalCandidates();
    //console.log(`Total candidates: ${totalCandidates.toString()}`);

    console.log("Candidates details:")
    for (let id = 1; id <= 3; id++) {
        
        let candidate = await ballotBox.candidates(id);
        console.log(candidate)
        console.log(`ID: ${id}`);
        console.log(`Name: ${candidate.name}`)
        console.log(`Party: ${candidate.party}`)
        console.log(`Votes: ${candidate.voteCount.toString()}`)
        console.log("---------------------")
    }
  } catch (error) {
    console.error("Failed get candidate data", error)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
