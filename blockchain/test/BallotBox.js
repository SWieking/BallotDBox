const { expect } = require("chai")
const { time } = require("@nomicfoundation/hardhat-network-helpers")

describe("BallotBox", function() {
    let deployer, user1, user2, user3, user4, user5
    let users
    let ballotBox
    let startTime, endTime
    //const NAME = "BallotBox"
    //const SYMBOL = "BB"

    const candidateList = [
        {id: 1,name : "Merkel", party: "CDU"},
        {id: 2,name: "Schroeder", party: "SPD"},
        {id: 3,name: "Wagenknecht", party: "BSW"}
    ]
    
    beforeEach(async () => {
        [deployer,user1, user2, user3, user4, user5] = await ethers.getSigners()
        users = [user1, user2, user3, user4, user5]
        const BallotBox = await ethers.getContractFactory("BallotBox")
        ballotBox = await BallotBox.deploy()
        
        // add Candidates
        for(let i = 1; i < candidateList.length+1; i++){
            const candidate = candidateList[i-1]
            await ballotBox.connect(deployer).addCandidate(candidate.id,candidate.name, candidate.party)
        }

        // add eligible voters
        for(i = 0; i< users.length; i++){
            await ballotBox.connect(deployer).addEligibleVoter(users[i].address)
        }
        
    })


    describe("Add Candidates", () => {

        it("Check initial candidates", async() => {
            totalCandidates = await ballotBox.totalCandidates()
            expect(totalCandidates).to.equal(candidateList.length)

            for(let i = 1; i < totalCandidates; i++){
                result = await ballotBox.candidates(i)
                expect(result.name).to.equal(candidateList[i-1].name)
                expect(result.name).to.equal(candidateList[i-1].name)
            }
        })

        it("Add candidate",async () => {
            // add new candidate
            const name = "Peter"
            const party = "Lustig"
            const id = 4
            const tx = await ballotBox.connect(deployer).addCandidate(id,name,party)
            await tx.wait()

            // check updated length
            totalCandidates = await ballotBox.totalCandidates()
            expect(totalCandidates).to.equal(candidateList.length+1)

            // check new candidate
            result = await ballotBox.candidates(id)
            expect(result.name).to.equal(name)
            expect(result.party).to.equal(party)
        })

        it("Delete candidate", async () => {
            const tx = await ballotBox.connect(deployer).deleteCandidate(1)
            await tx.wait()

            //Check the total number of Candidates
            const totalCandidates = await ballotBox.totalCandidates();
            expect(totalCandidates).to.equal(candidateList.length -1);

            //Check if deleted correctly
            const deletedCandidate = await ballotBox.candidates(0)
            expect(deletedCandidate.id).to.equal(0);
            expect(deletedCandidate.name).to.equal("");
            expect(deletedCandidate.party).to.equal("");
            expect(deletedCandidate.voteCount).to.equal(0);
        })
    })

    describe("Add eligible User", () => {
        it("add one User", async () => {
            const userAddr = user2.address
            const tx = await ballotBox.connect(deployer).addEligibleVoter(userAddr)
            await tx.wait()
            result = await ballotBox.checkEligibleVoter(userAddr)
            expect(result).to.be.true
        })
    })

    describe("Vote", () => {
        it("Votes and verifies counts", async() => {

            // Set Election time period
            const currentTime = Math.floor(Date.now() / 1000);
            startTime = currentTime + 60;
            endTime = currentTime + 3600;
            await ballotBox.connect(deployer).setElectionTime(startTime, endTime);
            //console.log(`Election time set from ${startTime} to ${endTime}`);

            // Increase blockchain time to just past the start time
            await time.increase(61)

            let localVotesCount = Array(candidateList.length).fill(0)
            let localTotalVotes = 0
            let user 
            let r_id

            for(i = 0 ; i < 5 ; i++){
                user = users[i]
                r_id = Math.floor(Math.random() * (candidateList.length))
                tx = await ballotBox.connect(user).vote(r_id)
                await tx.wait()

                localVotesCount[r_id] ++
                localTotalVotes ++

                const candidate = await ballotBox.candidates(r_id)
                const totalVotes = await ballotBox.getTotalVotes()        
                
                expect(candidate.voteCount).to.equal(localVotesCount[r_id], "Votes for ${candidateList[r_id].name} do not match")
                expect(totalVotes).to.equal(localTotalVotes, "Total votes do not match")
            }
            
        })
            
    })

})