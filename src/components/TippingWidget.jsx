import React, { useMemo, useState } from 'react';
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, isAddress } from 'viem';
import {
  Send,
  ExternalLink,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { EXPLORERS } from '../lib/web3';

const QUICK_AMOUNTS = ['0.001', '0.005', '0.01', '0.05'];

export default function TippingWidget() {
  const { address, isConnected, chainId } = useAccount();
  const { data: balanceData } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const {
    data: txHash,
    sendTransaction,
    isPending: isSending,
    error: sendError,
    reset: resetSend,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const explorerBase = EXPLORERS[chainId];
  const txUrl = txHash && explorerBase ? `${explorerBase}/tx/${txHash}` : null;

  const recipientValid = recipient.length === 0 || isAddress(recipient);
  const amountNumber = Number(amount);
  const amountValid =
    amount.length === 0 || (!Number.isNaN(amountNumber) && amountNumber > 0);

  const balanceNumber = balanceData ? Number(balanceData.formatted) : 0;
  const exceedsBalance =
    amount.length > 0 && amountValid && amountNumber > balanceNumber;

  const canSend = useMemo(() => {
    return (
      isConnected &&
      isAddress(recipient) &&
      !Number.isNaN(amountNumber) &&
      amountNumber > 0 &&
      !exceedsBalance &&
      !isSending &&
      !isConfirming
    );
  }, [isConnected, recipient, amountNumber, exceedsBalance, isSending, isConfirming]);

  const handleSend = (e) => {
    e.preventDefault();
    setFormError('');

    if (!isConnected) {
      setFormError('Connect your wallet first.');
      return;
    }
    if (!isAddress(recipient)) {
      setFormError('Enter a valid recipient address (0x…).');
      return;
    }
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setFormError('Enter an amount greater than 0.');
      return;
    }
    if (exceedsBalance) {
      setFormError('Amount exceeds your wallet balance.');
      return;
    }

    let value;
    try {
      value = parseEther(amount);
    } catch {
      setFormError('Invalid ETH amount.');
      return;
    }

    sendTransaction({ to: recipient, value });
  };

  const handleReset = () => {
    resetSend();
    setRecipient('');
    setAmount('');
    setFormError('');
  };

  const prettySendError = (err) => {
    if (!err) return '';
    const msg = err.shortMessage || err.message || 'Transaction failed.';
    if (/user rejected|denied/i.test(msg)) return 'Transaction rejected in wallet.';
    if (/insufficient funds/i.test(msg)) return 'Insufficient funds for amount + gas.';
    return msg;
  };

  // ---- Success state ----
  if (isConfirmed && txHash) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-base-panel p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold">Tip sent!</h2>
        <p className="mt-1 text-sm text-base-muted">
          Your {amount} ETH tip was confirmed on-chain.
        </p>

        <div className="mt-4 rounded-xl border border-base-edge bg-base-dark/60 p-3 text-left">
          <p className="text-[11px] uppercase tracking-wide text-base-muted">To</p>
          <p className="break-all font-mono text-xs">{recipient}</p>
          <p className="mt-2 text-[11px] uppercase tracking-wide text-base-muted">
            Transaction
          </p>
          <p className="break-all font-mono text-xs">{txHash}</p>
        </div>

        {txUrl && (
          <a
            href={txUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-base-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-base-blue/90"
          >
            View on Basescan <ExternalLink className="h-4 w-4" />
          </a>
        )}

        <button
          onClick={handleReset}
          className="mt-3 w-full rounded-xl border border-base-edge px-4 py-3 text-sm font-semibold text-base-muted transition-colors hover:bg-base-edge hover:text-white"
        >
          Send another tip
        </button>
      </div>
    );
  }

  // ---- Form / pending state ----
  return (
    <form
      onSubmit={handleSend}
      className="rounded-2xl border border-base-edge bg-base-panel p-6"
    >
      {/* Recipient */}
      <label className="block">
        <span className="text-sm font-medium text-white">Recipient address</span>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.trim())}
          placeholder="0x0000…0000"
          spellCheck={false}
          className={`mt-1.5 w-full rounded-xl border bg-base-dark px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-base-muted/60 focus:border-base-blue ${
            recipientValid ? 'border-base-edge' : 'border-red-500/60'
          }`}
        />
      </label>
      {!recipientValid && (
        <p className="mt-1.5 text-xs text-red-400">Not a valid address.</p>
      )}

      {/* Amount */}
      <label className="mt-4 block">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Amount (ETH)</span>
          {balanceData && (
            <span className="text-xs text-base-muted">
              Balance: {balanceNumber.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH
            </span>
          )}
        </div>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
          className={`mt-1.5 w-full rounded-xl border bg-base-dark px-4 py-3 text-sm outline-none transition-colors placeholder:text-base-muted/60 focus:border-base-blue ${
            amountValid && !exceedsBalance ? 'border-base-edge' : 'border-red-500/60'
          }`}
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(q)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              amount === q
                ? 'border-base-blue bg-base-blue/15 text-white'
                : 'border-base-edge text-base-muted hover:border-base-blue/50 hover:text-white'
            }`}
          >
            {q} ETH
          </button>
        ))}
      </div>

      {exceedsBalance && (
        <p className="mt-2 text-xs text-red-400">
          Amount exceeds your balance (gas not included).
        </p>
      )}

      {/* Errors */}
      {(formError || sendError) && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{formError || prettySendError(sendError)}</span>
        </div>
      )}

      {/* Confirming banner */}
      {txHash && isConfirming && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-base-blue/40 bg-base-blue/10 p-3 text-sm text-base-blue">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Waiting for confirmation…</span>
          {txUrl && (
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline"
            >
              Track <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Submit */}
      {!isConnected ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-base-edge bg-base-dark px-4 py-3 text-sm text-base-muted">
          <Wallet className="h-4 w-4" />
          Connect your wallet to send a tip
        </div>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-base-blue px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-base-blue/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Confirm in wallet…
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send tip
            </>
          )}
        </button>
      )}

      <p className="mt-3 text-center text-[11px] text-base-muted">
        Tips are native ETH transfers signed directly by your wallet on Base.
      </p>
    </form>
  );
}
