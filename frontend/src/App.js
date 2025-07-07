import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Contract details
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const contractABI = [
    {
      "inputs": [],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotal",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Debug function to verify contract connection
  const verifyContractConnection = async () => {
    if (!contract) return;
    
    console.log("=== Contract Debug Info ===");
    console.log("Contract Address:", contractAddress);
    console.log("Contract Instance:", contract);
    
    try {
      const currentVotes = await contract.getTotal();
      console.log("Current Total Votes:", Number(currentVotes));
      console.log("=== Debug Complete ===");
    } catch (error) {
      console.error("Debug Error:", error);
    }
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    // Run verification whenever contract changes
    verifyContractConnection();
  }, [contract]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);
      
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      
      checkVotingStatus();
    }
  };

  const checkVotingStatus = async () => {
    if (contract) {
      const votes = await contract.getTotal();
      setTotalVotes(Number(votes));
    }
  };

  const handleVote = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      console.log("Initiating vote transaction...");
      const tx = await contract.vote();
      console.log("Transaction sent, waiting for confirmation...", tx.hash);
      
      await tx.wait();
      console.log("Transaction confirmed!");
      
      setHasVoted(true);
      await checkVotingStatus();
    } catch (error) {
      console.error("Voting failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Encrypted Voting dApp</h1>
        
        {account ? (
          <div className="voting-container">
            <p>Connected as: {account.substring(0, 6)}...{account.substring(38)}</p>
            <p>Total Votes: {totalVotes}</p>
            
            {!hasVoted ? (
              <button 
                onClick={handleVote} 
                disabled={loading}
                className="vote-button"
              >
                {loading ? 'Processing...' : 'Cast Encrypted Vote'}
              </button>
            ) : (
              <p>✅ Thank you for voting!</p>
            )}
          </div>
        ) : (
          <button onClick={checkWalletConnection} className="connect-button">
            Connect Wallet
          </button>
        )}
      </header>
    </div>
  );
}

export default App;