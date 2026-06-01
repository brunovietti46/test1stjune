import React from 'react';
import { useAccount } from 'wagmi';
import { CHAIN_LABELS } from '../lib/web3';

export default function Header() {
  const { chainId, isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-20 border-b border-base-edge/60 bg-base-dark/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-blue">
            <span className="text-sm font-extrabold text-white">B</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">Base Tip</p>
            <p className="text-[11px] text-base-muted">
              {isConnected ? CHAIN_LABELS[chainId] || 'Unsupported network' : 'Web3 tipping widget'}
            </p>
          </div>
        </div>

        {/* Reown AppKit web component renders the connect / account button */}
        <appkit-button balance="hide" />
      </div>
    </header>
  );
}
