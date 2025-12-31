import { useState } from 'react';
import { ethers } from 'ethers';
import { useWepin } from '@/contexts/WepinContext';
import { toast } from '@/hooks/use-toast';
import EventTicketABI from '@/abis/EventTicket.json';
import EventFactoryABI from '@/abis/EventFactory.json';

export interface PurchaseResult {
  txHash: string;
  tokenId: number;
  blockNumber: number;
}

export function useContract() {
  const { isConnected, connect } = useWepin();
  const [loading, setLoading] = useState(false);

  // Get provider and signer
  const getProviderAndSigner = async () => {
    if (!window.ethereum) {
      throw new Error('No wallet found. Please install MetaMask or use Wepin wallet.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  };

  // Buy a ticket (mints NFT)
  const buyTicket = async (contractAddress: string, priceInVery: number): Promise<PurchaseResult> => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const { provider, signer } = await getProviderAndSigner();

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, EventTicketABI, signer);

      // Get event info
      const eventInfo = await contract.getEventInfo();
      console.log('Event Info:', {
        name: eventInfo.name,
        price: ethers.formatEther(eventInfo.ticketPrice),
        minted: eventInfo.minted.toString(),
        max: eventInfo.maxTickets.toString(),
        active: eventInfo.active
      });

      // Check if sold out
      if (eventInfo.minted >= eventInfo.maxTickets) {
        throw new Error('Event is sold out');
      }

      // Check if event is active
      if (!eventInfo.active) {
        throw new Error('Event is not active');
      }

      const priceWei = eventInfo.ticketPrice;

      // Send transaction
      console.log('Minting ticket...', {
        price: ethers.formatEther(priceWei),
        to: contractAddress
      });

      const tx = await contract.mintTicket({ value: priceWei });

      toast({
        title: 'Transaction sent',
        description: 'Waiting for confirmation...',
      });

      console.log('Transaction hash:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      // Extract token ID from Transfer event
      let tokenId = 0;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });

          if (parsed && parsed.name === 'Transfer') {
            tokenId = Number(parsed.args.tokenId);
            console.log('Token ID:', tokenId);
            break;
          }
        } catch (e) {
          // Not our event, continue
        }
      }

      if (!tokenId) {
        console.warn('Could not extract token ID from receipt');
        // Fallback: get current minted count
        const updatedInfo = await contract.getEventInfo();
        tokenId = Number(updatedInfo.minted);
      }

      return {
        txHash: tx.hash,
        tokenId,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      console.error('Error buying ticket:', error);

      // Parse error message
      let errorMessage = 'Failed to purchase ticket';
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Purchase failed',
        description: errorMessage,
        variant: 'destructive',
      });

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify ticket ownership
  const verifyTicketOwnership = async (
    contractAddress: string,
    tokenId: number
  ): Promise<{ owner: string; used: boolean }> => {
    try {
      const { provider } = await getProviderAndSigner();
      const contract = new ethers.Contract(contractAddress, EventTicketABI, provider);

      const [owner, used] = await Promise.all([
        contract.ownerOf(tokenId),
        contract.ticketUsed(tokenId)
      ]);

      return {
        owner: owner.toLowerCase(),
        used
      };
    } catch (error) {
      console.error('Error verifying ticket:', error);
      throw error;
    }
  };

  // Get event details from contract
  const getEventDetails = async (contractAddress: string) => {
    try {
      const { provider } = await getProviderAndSigner();
      const contract = new ethers.Contract(contractAddress, EventTicketABI, provider);

      const eventInfo = await contract.getEventInfo();

      return {
        name: eventInfo.name,
        date: new Date(Number(eventInfo.date) * 1000),
        price: ethers.formatEther(eventInfo.ticketPrice),
        maxTickets: Number(eventInfo.maxTickets),
        ticketsSold: Number(eventInfo.minted),
        active: eventInfo.active
      };
    } catch (error) {
      console.error('Error getting event details:', error);
      throw error;
    }
  };

  // Check if user owns a ticket for this event
  const checkUserHasTicket = async (
    contractAddress: string,
    userAddress: string
  ): Promise<number | null> => {
    try {
      const { provider } = await getProviderAndSigner();
      const contract = new ethers.Contract(contractAddress, EventTicketABI, provider);

      const eventInfo = await contract.getEventInfo();
      const totalMinted = Number(eventInfo.minted);

      // Check each token ID
      for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            return tokenId;
          }
        } catch (e) {
          // Token might not exist or be burned
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking user ticket:', error);
      return null;
    }
  };

  return {
    loading,
    buyTicket,
    verifyTicketOwnership,
    getEventDetails,
    checkUserHasTicket,
  };
}
