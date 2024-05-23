// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

contract BallotBox{

    address public owner;
    uint256 public totalCandidates;
    uint256 public totalVotes;
    uint256 public startTime;
    uint256 public endTime;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct VoterStatus {
        bool isEligible;
        bool hasVoted;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => VoterStatus) public votersStatus;

    modifier onlyOwner(){
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyEligibleVoter(){
        require(votersStatus[msg.sender].isEligible);
        _;
    }

    constructor() {
        owner = msg.sender;
        totalCandidates = 0;
    }

    function addEligibleVoter(address addr) public onlyOwner{
        votersStatus[addr].isEligible = true;
    }

    function checkEligibleVoter(address addr) public view returns (bool) {
        return votersStatus[addr].isEligible;
    }

    function addCandidate(uint256 _id, string memory _name, string memory _party) public onlyOwner {
        require((startTime == 0 && endTime == 0) || block.timestamp < startTime, "Elections have already started");
        candidates[_id] = Candidate(_id, _name, _party, 0);
        totalCandidates ++;
    }

    function deleteCandidate(uint256 _id) public onlyOwner{
        require(candidates[_id].id != 0, "Candidate does not exist");
        require((startTime == 0 && endTime == 0) || block.timestamp < startTime, "Elections have already started");
        delete candidates[_id];
        totalCandidates --;
    }

    function updateCandidate(uint256 _id, string memory _name, string memory _party) public onlyOwner{
        require(candidates[_id].id != 0, "Candidate does not exist");
        require((startTime == 0 && endTime == 0) || block.timestamp < startTime, "Elections have already started");
        candidates[_id].name = _name;
        candidates[_id].party = _party;
    }

    function getCandidate(uint256 _id) public view returns (Candidate memory) {
        require(candidates[_id].id != 0, "Candidate does not exist");
        return candidates[_id];
    }

    function vote(uint256 _id) public onlyEligibleVoter{
        require(!votersStatus[msg.sender].hasVoted);
        require(startTime != 0 && endTime != 0, "Times not set");
        require(block.timestamp >= startTime, "Vote not startet");
        require(block.timestamp <= endTime, "Vote endet");
        votersStatus[msg.sender].hasVoted = true;
        candidates[_id].voteCount ++;
        totalVotes ++;
    }

    function getVoteCount(uint256 _id) public view returns (uint256){
        return candidates[_id].voteCount;
    }

    function getTotalVotes() public view returns (uint256){
        return totalVotes;
    }

    function setVotingTime(uint256 _startTime, uint256 _endTime) public onlyOwner{
        require(startTime == 0 && endTime == 0, "Times already set");
        require(_startTime > 0 && _startTime > block.timestamp && _endTime > 0 && _endTime > _startTime, "Invalid Times");
        startTime = _startTime;
        endTime = _endTime;
    }

    function getVotingTime() public view returns (uint256, uint256) {
        return (startTime, endTime);
    }


}