"use client";

import { FC, useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ArrowLine, ExitIcon, WalletIcon, WhiteWalletIcon } from "./SvgIcon";

const ConnectButton: FC = () => {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect, connected, connecting } = useWallet();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const truncatedAddress = publicKey 
    ? `${publicKey.toBase58().slice(0, 4)}....${publicKey.toBase58().slice(-4)}`
    : '';

  const toggleDropdown = () => {
    if (!isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <button 
        ref={buttonRef}
        className="rounded-xl bg-primary-200 text-white tracking-[0.32px] py-2 px-4"
        onClick={() => connected ? toggleDropdown() : setVisible(true)}
        disabled={connecting || isDisconnecting}
        aria-label={connected ? "Wallet options" : "Connect wallet"}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
      >
        {connecting ? (
          <div className="text-[12px] lg:text-[16px]">Connecting...</div>
        ) : connected && publicKey ? (
          <div className="flex items-center justify-center text-[12px] lg:text-[16px]">
            {truncatedAddress}
            <div className="rotate-90 w-3 h-3 ml-1">
              <ArrowLine />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 text-[12px] lg:text-[16px]">
            <WhiteWalletIcon /> Connect Wallet
          </div>
        )}
      </button>
      
      {connected && isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className="fixed z-50"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          <nav aria-label="Wallet options">
            <ul className="border-[0.75px] border-[#89C7B5] rounded-lg bg-[#162923] p-2 mt-2 w-[200px]">
              <li>
                <button
                  className="flex w-full gap-2 items-center text-white tracking-[-0.32px] cursor-pointer text-left p-2 hover:bg-[#1e3730] rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisible(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  <WalletIcon /> Change Wallet
                </button>
              </li>
              <li>
                <button
                  className="flex w-full gap-2 items-center text-white tracking-[-0.32px] cursor-pointer text-left p-2 hover:bg-[#1e3730] rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisconnect();
                    setIsDropdownOpen(false);
                  }}
                  disabled={isDisconnecting}
                >
                  <ExitIcon /> {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default ConnectButton;