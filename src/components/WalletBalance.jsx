import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Wallet, RefreshCw } from 'lucide-react';
import { CHAIN_LABELS } from '../lib/web3';

function shorten(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletBalance() {
  const { address, chainId } = useAccount();
  const { data, isLoading, isError, refetch, isRefetching } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  const formatted = data ? Number(data.formatted) : 0;

  return (
    <div className="mb-4 rounded-2xl border border-base-edge bg-base-panel p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-blue/15 ring-1 ring-base-blue/30">
            <Wallet className="h-5 w-5 text-base-blue" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-base-muted">
              Connected wallet
            </p>
            <p className="font-mono text-sm font-medium">{shorten(address)}</p>
            <p className="mt-0.5 text-[11px] text-base-muted">
              {CHAIN_LABELS[chainId] || 'Unsupported network'}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="rounded-lg p-2 text-base-muted transition-colors hover:bg-base-edge hover:text-white"
          title="Refresh balance"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mt-4 border-t border-base-edge pt-4">
        <p className="text-[11px] uppercase tracking-wide text-base-muted">Balance</p>
        {isLoading ? (
          <div className="mt-1 h-7 w-32 animate-pulse rounded bg-base-edge" />
        ) : isError ? (
          <p className="mt-1 text-sm text-red-400">Failed to load balance</p>
        ) : (
          <p className="mt-1 text-2xl font-bold">
            {formatted.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
            <span className="text-base font-medium text-base-muted">
              {data?.symbol || 'ETH'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
