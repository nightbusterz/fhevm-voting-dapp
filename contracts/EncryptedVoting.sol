// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/FHE.sol";

contract EncryptedVoting {
    // Encrypted vote storage
    euint32 private encryptedTotal;
    
    // Track voting status (still public)
    mapping(address => bool) public hasVoted;
    
    // Events for frontend tracking
    event VoteCast(address indexed voter);
    event EncryptedTallyUpdated(euint32 newTally);

    function vote() public {
        require(!hasVoted[msg.sender], "Already voted");
        
        // Encrypt a single vote (as euint32)
        euint32 encryptedVote = FHE.asEuint32(1);
        
        // Add to encrypted total
        encryptedTotal = FHE.add(encryptedTotal, encryptedVote);
        
        // Update state
        hasVoted[msg.sender] = true;
        
        // Emit events
        emit VoteCast(msg.sender);
        emit EncryptedTallyUpdated(encryptedTotal);
    }

    // Get encrypted total (frontend can decrypt with permissions)
    function getEncryptedTotal() public view returns (euint32) {
        return encryptedTotal;
    }

    // Get decrypted total (requires decryption auth)
    function getDecryptedTotal() public view returns (uint32) {
        return FHE.decrypt(encryptedTotal);
    }
}