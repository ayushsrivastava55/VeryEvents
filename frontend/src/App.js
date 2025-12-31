import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import CreateEvent from './components/CreateEvent';
import MyTickets from './components/MyTickets';
import './App.css';

const VERY_CHAIN_ID = 4613;
const VERY_RPC_URL = 'https://rpc.very.network';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('veryevents_token'));
  const [view, setView] = useState('events');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
      
      window.ethereum.on('chainChanged', (id) => {
        setChainId(parseInt(id, 16));
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or use Wepin wallet');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      const id = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(id, 16));
      
      if (parseInt(id, 16) !== VERY_CHAIN_ID) {
        await switchToVeryChain();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const switchToVeryChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${VERY_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${VERY_CHAIN_ID.toString(16)}`,
            chainName: 'VERY Mainnet',
            nativeCurrency: { name: 'VERY', symbol: 'VERY', decimals: 18 },
            rpcUrls: [VERY_RPC_URL],
            blockExplorerUrls: ['https://veryscan.io'],
          }],
        });
      }
    }
  };

  const handleEventClick = (eventId) => {
    setSelectedEventId(eventId);
    setView('event-detail');
  };

  const handleEventCreated = (event) => {
    setView('events');
  };

  const renderView = () => {
    switch (view) {
      case 'event-detail':
        return (
          <EventDetail 
            eventId={selectedEventId} 
            token={token}
            walletAddress={account}
            provider={provider}
            onBack={() => setView('events')}
          />
        );
      case 'create':
        return <CreateEvent token={token} onEventCreated={handleEventCreated} />;
      case 'tickets':
        return <MyTickets token={token} />;
      default:
        return <EventList onEventClick={handleEventClick} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo" onClick={() => setView('events')}>
          <h1>VeryEvents</h1>
          <span>Powered by Very Network</span>
        </div>
        
        <nav>
          <button className={view === 'events' ? 'active' : ''} onClick={() => setView('events')}>
            Discover
          </button>
          <button className={view === 'create' ? 'active' : ''} onClick={() => setView('create')}>
            Create Event
          </button>
          <button className={view === 'tickets' ? 'active' : ''} onClick={() => setView('tickets')}>
            My Tickets
          </button>
        </nav>

        <div className="wallet-section">
          {account ? (
            <div className="wallet-info">
              <span className={chainId === VERY_CHAIN_ID ? 'chain-ok' : 'chain-wrong'}>
                {chainId === VERY_CHAIN_ID ? '🟢 VERY Chain' : '🔴 Wrong Network'}
              </span>
              <span className="address">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              {chainId !== VERY_CHAIN_ID && (
                <button onClick={switchToVeryChain}>Switch Network</button>
              )}
            </div>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main>{renderView()}</main>

      <footer>
        <p>Built for Very Network Hackathon | Chain ID: {VERY_CHAIN_ID}</p>
        <a href="https://veryscan.io" target="_blank" rel="noopener noreferrer">VeryScan Explorer</a>
      </footer>
    </div>
  );
}

export default App;
