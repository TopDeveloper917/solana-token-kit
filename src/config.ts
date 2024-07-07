import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  TxVersion,
  Token,
  Currency,
  TOKEN_PROGRAM_ID,
  SOL,
  Percent,
} from "@raydium-io/raydium-sdk";

export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "";

export const SOL_PRICE_API = process.env.SOLANA_PRICE_API ?? "";

export const PINATA_API_KEY = "8b4aa3ea5c3c1cccd800";
export const PINATA_SECRET_API_KEY = "a307900c00333e7f8af17c97f18abf1b61eec663801a332ca6527216662bb48e"

export const DEFAULT_TOKEN = {
  SOL: SOL,
  SOL1: new Currency(9, "USDC", "USDC"),
  WSOL: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("So11111111111111111111111111111111111111112"),
    9,
    "WSOL",
    "WSOL"
  ),
  USDC: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    6,
    "USDC",
    "USDC"
  ),
};
