import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [encryptedTotal, setEncryptedTotal] = useState(null);
  const [decryptedTotal, setDecryptedTotal] = useState('Connect to view');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Memoized contract ABI
  const contractABI = useMemo(() => [
    {
      "inputs": [],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getEncryptedTotal",
      "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getDecryptedTotal",
      "outputs": [{"internalType": "uint32", "name": "", "type": "uint32"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "", "type": "address"}],
      "name": "hasVoted",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    }
  ], []);

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Memoized updateVoteData function
  const updateVoteData = useCallback(async (contractInstance) => {
    try {
      setLoading(true);
      const encrypted = await contractInstance.getEncryptedTotal();
      setEncryptedTotal(encrypted);
      
      try {
        const decrypted = await contractInstance.getDecryptedTotal();
        setDecryptedTotal(Number(decrypted));
      } catch (decryptError) {
        console.log("Decryption not available:", decryptError);
        setDecryptedTotal('Encrypted only');
      }
    } catch (error) {
      console.error("Data fetch failed:", error);
      setEncryptedTotal('Error loading');
      setDecryptedTotal('Error loading');
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized connectWallet with all dependencies
  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(votingContract);
        
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        
        const voted = await votingContract.hasVoted(accounts[0]);
        setHasVoted(voted);
        await updateVoteData(votingContract);
      } catch (error) {
        console.error("Connection failed:", error);
        setDecryptedTotal('Connection error');
      } finally {
        setLoading(false);
      }
    }
  }, [contractABI, updateVoteData]); // Now includes updateVoteData

  const handleVote = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const tx = await contract.vote();
      setTxHash(tx.hash);
      await tx.wait();
      setHasVoted(true);
      await updateVoteData(contract);
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum?.selectedAddress) {
        await connectWallet();
      }
    };
    init();
  }, [connectWallet]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>FHE Encrypted Voting dApp</h1>
        
        {!account ? (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <div className="voting-container">
            <p>Connected as: {account.substring(0, 6)}...{account.substring(38)}</p>
            
            <div className="vote-status">
              {hasVoted ? (
                <p className="voted-badge">✓ Already Voted</p>
              ) : (
                <button 
                  onClick={handleVote} 
                  disabled={loading}
                  className="vote-button"
                >
                  {loading ? 'Processing...' : 'Cast Encrypted Vote'}
                </button>
              )}
            </div>
            
            <div className="results-container">
              <div className="encrypted-data">
                <h3>Encrypted Tally</h3>
                <div className="data-box">
                  {encryptedTotal === 'Error loading' ? (
                    <span className="error-text">Failed to load</span>
                  ) : encryptedTotal ? (
                    `0x${encryptedTotal.substring(0, 24)}...`
                  ) : (
                    <div className="loading-spinner"></div>
                  )}
                </div>
              </div>
              
              <div className="decrypted-data">
                <h3>Current Total Votes</h3>
                <div className="data-box">
                  {typeof decryptedTotal === 'number' ? (
                    decryptedTotal
                  ) : (
                    <span className={decryptedTotal === 'Error loading' ? 'error-text' : 'status-text'}>
                      {decryptedTotal}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {txHash && (
              <div className="tx-info">
                <p>Latest Transaction:</p>
                <a 
                  href={`https://localhost:8545/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {txHash.substring(0, 12)}...{txHash.substring(58)}
                </a>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;