import { AuthorityType, createSetAuthorityInstruction} from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";


export async function revokeMintAuthority(
    connection : Connection,
    wallet : WalletContextState,
    mintAddress : PublicKey,
) {
    if(wallet.publicKey != null) {
        const transaction = new Transaction();
        transaction.add(await createSetAuthorityInstruction(mintAddress, wallet.publicKey, AuthorityType.MintTokens, null));

        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = wallet.publicKey;
        if(wallet.signTransaction != undefined) {
            try {
                let signTX = await wallet.signTransaction(transaction);
                const signature = await connection.sendRawTransaction(signTX.serialize());
                console.log("signature ====>", signature);
            } catch(err) {
                console.log("revoking error ====>", err);
            }
        }
    }
}