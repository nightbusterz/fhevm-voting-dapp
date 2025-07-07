// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EncryptedVoting {
    uint256 private totalVotes;
    mapping(address => bool) private hasVoted;
    
    function vote() public {
        require(!hasVoted[msg.sender], "Already voted");
        totalVotes++;
        hasVoted[msg.sender] = true;
    }
    
    function getTotal() public view returns (uint256) {
        return totalVotes;
    }
}