import React from 'react';
import { useAccount } from 'wagmi';
import { Coins } from 'lucide-react';
import Header from './components/Header.jsx';
import WalletBalance from './components/WalletBalance.jsx';
import TippingWidget from './components/TippingWidget.jsx';

export default function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-base-dark text-white font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-base-blue/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-base-blue/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="mx-auto w-full max-w-lg px-4 pb-20 pt-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-blue/15 ring-1 ring-base-blue/30">
              <Coins className="h-7 w-7 text-base-blue" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Send a tip on Base</h1>
            <p className="mt-2 text-sm text-base-muted">
              Connect your wallet, enter a recipient and amount, and send ETH directly
              from your browser. No backend, fully on-chain.
            </p>
          </div>

          {isConnected && <WalletBalance />}
          <TippingWidget />
        </main>
      </div>
    </div>
  );
}
