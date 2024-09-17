pragma solidity ^0.8.9;

contract BallotBox{

    uint256 public isDeployed; //indicator to externally verify that the contract has been successfully deployed
    address public owner; //address of the contract's owner, who has special permissions
    uint256 public totalCandidates;
    uint256 public totalVotes;
    uint256 public startTime; //start time of the election
    uint256 public endTime; //end time of the election

    //struct representing a candidate in the election
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    //struct representing the status of a voter
    struct VoterStatus {
        bool isEligible;
        bool hasVoted;
    }

    //mapping of candidate IDs to their respective Candidate struct
    mapping(uint => Candidate) public candidates;
    //mapping of voter addresses to their respective VoterStatus struct
    mapping(address => VoterStatus) public votersStatus;

   //modifier to restrict access to only the contract owner
    modifier onlyOwner(){
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    //modifier to restrict actions to only eligible voters
    modifier onlyEligibleVoter(){
        require(votersStatus[msg.sender].isEligible);
        _;
    }

    //constructor function that runs when the contract is deployed
    constructor() {
        owner = msg.sender;
        totalCandidates = 0;
        isDeployed = 1;
    }

    //function to add an eligible voter, restricted to the owner
    function addEligibleVoter(address addr) public onlyOwner{
        votersStatus[addr].isEligible = true;
    }

    //function to check if a given address is an eligible voter
    function checkEligibleVoter(address addr) public view returns (bool) {
        return votersStatus[addr].isEligible;
    }

    //function to add a candidate to the election, restricted to the owner
    function addCandidate(uint256 _id, string memory _name, string memory _party) public onlyOwner {
        require((startTime == 0 && endTime == 0) || block.timestamp < startTime, "Elections have already started");
        candidates[_id] = Candidate(_id, _name, _party, 0);
        totalCandidates ++;
    }

    //function to remove a candidate from the election, restricted to the owner
    function deleteCandidate(uint256 _id) public onlyOwner{
        require(candidates[_id].id != 0, "Candidate does not exist");
        require((startTime == 0 && endTime == 0) || block.timestamp < startTime, "Elections have already started");
        delete candidates[_id];
        totalCandidates --;
    }

    //function to update a candidate's information, restricted to the owner
    function updateCandidate(uint256 _id, string memory _name, string memory _party) public onlyOwner{
        require(candidates[_id].id != 0, "Candidate does not exist");
        require((startTime == 0 && endTime == 0) || block.timestamp < startTime, "Elections have already started");
        candidates[_id].name = _name;
        candidates[_id].party = _party;
    }

    //function to retrieve the details of a specific candidate
    function getCandidate(uint256 _id) public view returns (Candidate memory) {
        require(candidates[_id].id != 0, "Candidate does not exist");
        return candidates[_id];
    }

    //function to cast a vote, restricted to eligible voters
    function vote(uint256 _id) public onlyEligibleVoter{
        require(!votersStatus[msg.sender].hasVoted, "Already voted");
        require(startTime != 0 && endTime != 0, "Times not set");
        require(block.timestamp >= startTime, "Vote not startet");
        require(block.timestamp <= endTime, "Vote endet");
        require(candidates[_id].id != 0, "Candidate does not exists");
        votersStatus[msg.sender].hasVoted = true;
        candidates[_id].voteCount ++;
        totalVotes ++;
    }

    //function to retrieve the vote count for a specific candidate
    function getVoteCount(uint256 _id) public view returns (uint256){
        return candidates[_id].voteCount;
    }

    //function to retrieve the total number of votes cast in the election
    function getTotalVotes() public view returns (uint256){
        return totalVotes;
    }

    //function to set the start and end times for the election, restricted to the owner
    function setElectionTime(uint256 _startTime, uint256 _endTime) public onlyOwner{
        require(startTime == 0 && endTime == 0, "Times already set");
        require(_startTime > 0 && _startTime > block.timestamp && _endTime > 0 && _endTime > _startTime, "Invalid Times");
        startTime = _startTime;
        endTime = _endTime;
    }

    //function to retrieve the start and end times of the election
    function getElectionTime() public view returns (uint256, uint256) {
        return (startTime, endTime);
    }
}