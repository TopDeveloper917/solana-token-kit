import { 
    TOKEN_PROGRAM_ID,
    getMinimumBalanceForRentExemptMint,
    getAssociatedTokenAddress,
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    MINT_SIZE
} from '@solana/spl-token';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair, TransactionInstruction, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { WalletContextState } from "@solana/wallet-adapter-react";
import { PROGRAM_ID, DataV2, createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Metaplex, MetaplexFileTag, walletAdapterIdentity } from '@metaplex-foundation/js';
import { PINATA_API_KEY, PINATA_SECRET_API_KEY } from '@/config';
import axios from 'axios';
import FormData from 'form-data';

async function uploadToPinata(file: Buffer | string, fileName: string) {
    const pinataEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    
    const formData = new FormData();

    let blob: Blob;
    blob = new Blob([file])

    formData.append("file", blob, fileName);

    const response = await axios.post(pinataEndpoint, formData, {
        maxBodyLength: Infinity,
        headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
    });

    if (response.status !== 200) {
        throw new Error(`Could not upload to Pinata, Status: ${response.status}`);
    }

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
}

export async function createSPLToken(owner: PublicKey, wallet: WalletContextState, connection: Connection, quantity: number, decimals: number, isChecked: boolean, tokenName: string, symbol: string, metadataURL: string, description: string, file: Readonly<{
    buffer: Buffer;
    fileName: string;
    displayName: string;
    uniqueName: string;
    contentType: string | null;
    extension: string | null;
    tags: MetaplexFileTag[];
}> | undefined,
    metadataMethod: string) {
    try {
        console.log("creating spl token")

        const mint_rent = await getMinimumBalanceForRentExemptMint(connection);

        const mint_account = Keypair.generate();
        let URI: string = ''
        console.log("start =====>");

        if (metadataMethod == 'url') {
            if (metadataURL != '') {
                URI = metadataURL
            }
            else {
                throw new Error('Please provide a metadata URL!');
            }
        }
        else {
            if (file) {
                console.log("upload ===>");
                const imageUri = await uploadToPinata(file.buffer, file.fileName);
                console.log("imageuri ===>", imageUri);
                if (imageUri) {
                    const metadata = {
                        name: tokenName,
                        symbol: symbol,
                        description: description,
                        image: imageUri,
                    };
                    const metadataUri = await uploadToPinata(JSON.stringify(metadata), 'metadata.json');
                    console.log("uri ===>", metadataUri);
                    if (metadataUri) {
                        URI = metadataUri
                    }
                }
            }
            else {
                throw new Error('Please provide an image file!');
            }
        }
        const tokenATA = await getAssociatedTokenAddress(
            mint_account.publicKey,
            owner
        );
        const createMetadataInstruction =
            createCreateMetadataAccountV3Instruction(
            {
                metadata: PublicKey.findProgramAddressSync(
                [
                    Buffer.from("metadata"),
                    PROGRAM_ID.toBuffer(),
                    mint_account.publicKey.toBuffer(),
                ],
                PROGRAM_ID
                )[0],
                mint: mint_account.publicKey,
                mintAuthority: owner,
                payer: owner,
                updateAuthority: owner,
            },
            {
                createMetadataAccountArgsV3: {
                data: {
                    name: tokenName,
                    symbol: symbol,
                    uri: URI,
                    creators: null,
                    sellerFeeBasisPoints: 0,
                    uses: null,
                    collection: null,
                },
                isMutable: true,
                collectionDetails: null,
                },
            }
        );

        const createNewTokenTransaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: owner,
                newAccountPubkey: mint_account.publicKey,
                space: MINT_SIZE,
                lamports: mint_rent,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMintInstruction(
                mint_account.publicKey,
                decimals,
                owner,
                owner,
                TOKEN_PROGRAM_ID
            ),
            createAssociatedTokenAccountInstruction(
                owner,
                tokenATA,
                owner,
                mint_account.publicKey
            ),
            createMintToInstruction(
                mint_account.publicKey,
                tokenATA,
                owner,
                quantity * 10 ** decimals
            ),
            createMetadataInstruction
        );

        // if (revokeMintBool) {
        //     let revokeMint = createSetAuthorityInstruction(
        //     mint_account.publicKey, // mint account || token account
        //     owner, // current auth
        //     AuthorityType.MintTokens, // authority type
        //     null
        //     );
        //     createNewTokenTransaction.add(revokeMint);
        // }

        // if (revokeFreezeBool) {
        //     let revokeFreeze = createSetAuthorityInstruction(
        //     mint_account.publicKey, // mint account || token account
        //     owner, // current auth
        //     AuthorityType.FreezeAccount, // authority type
        //     null
        //     );

        //     createNewTokenTransaction.add(revokeFreeze);
        // }


        if (!wallet.connected) {
            throw new WalletNotConnectedError();
        }
        
        // Ensure the wallet has the signTransaction method
        if (!wallet.signTransaction) {
            throw new Error('Wallet does not support transaction signing');
        }
    
        let blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
        createNewTokenTransaction.feePayer = owner;
        createNewTokenTransaction.recentBlockhash = blockhash;
    
        // Log transaction details before signing
        console.log("Transaction before signing:", createNewTokenTransaction);
    
        // Sign the transaction
        const signedTransaction = await wallet.signTransaction(createNewTokenTransaction);

        signedTransaction.partialSign(mint_account);
    
        // Log the signed transaction details
        console.log("Signed Transaction:", signedTransaction);
    
        // Send and confirm the transaction
        const signature = await sendAndConfirmRawTransaction(
            connection,
            signedTransaction.serialize(),
            { commitment: 'confirmed' }
        );
    
        console.log("Token Mint Address:", mint_account.publicKey.toString());
        console.log("Transaction signature:", signature);
        return mint_account.publicKey;
    }
        // const [metadataPDA] = await PublicKey.findProgramAddress(
        //     [
        //         Buffer.from("metadata"),
        //         PROGRAM_ID.toBuffer(),
        //         mint_account.publicKey.toBuffer(),
        //     ], PROGRAM_ID
        // );

        // let URI: string = ''
        // console.log("start =====>");

        // if (metadataMethod == 'url') {
        //     if (metadataURL != '') {
        //         URI = metadataURL
        //     }
        //     else {
        //         throw new Error('Please provide a metadata URL!');
        //     }
        // }
        // else {
        //     if (file) {
        //         console.log("upload ===>");
        //         const imageUri = await uploadToPinata(file.buffer, file.fileName);
        //         console.log("imageuri ===>", imageUri);
        //         if (imageUri) {
        //             const metadata = {
        //                 name: tokenName,
        //                 symbol: symbol,
        //                 description: description,
        //                 image: imageUri,
        //             };
        //             const metadataUri = await uploadToPinata(JSON.stringify(metadata), 'metadata.json');
        //             console.log("uri ===>", metadataUri);
        //             if (metadataUri) {
        //                 URI = metadataUri
        //             }
        //         }
        //     }
        //     else {
        //         throw new Error('Please provide an image file!');
        //     }
        // }

        // if (URI != '') {

        //     const tokenMetadata: DataV2 = {
        //         name: tokenName,
        //         symbol: symbol,
        //         uri: URI,
        //         sellerFeeBasisPoints: 0,
        //         creators: null,
        //         collection: null,
        //         uses: null
        //     };

        //     const args = {
        //         data: tokenMetadata,
        //         isMutable: true,
        //         collectionDetails: null
        //     };

        //     const createMintAccountInstruction = await SystemProgram.createAccount({
        //         fromPubkey: owner,
        //         newAccountPubkey: mint_account.publicKey,
        //         space: MintLayout.span,
        //         lamports: mint_rent,
        //         programId: TOKEN_PROGRAM_ID,
        //     });

        //     if (isChecked) {
        //         InitMint = await createInitializeMintInstruction(
        //             mint_account.publicKey,
        //             decimals,
        //             owner,
        //             owner,
        //             TOKEN_PROGRAM_ID
        //         );

        //     } else {
        //         InitMint = await createInitializeMintInstruction(
        //             mint_account.publicKey,
        //             decimals,
        //             owner,
        //             null,
        //             TOKEN_PROGRAM_ID
        //         );

        //     };

        //     const associatedTokenAccount = await getAssociatedTokenAddress(
        //         mint_account.publicKey,
        //         owner
        //     );

        //     const createATAInstruction = await createAssociatedTokenAccountInstruction(
        //         ASSOCIATED_TOKEN_PROGRAM_ID,
        //         TOKEN_PROGRAM_ID,
        //         mint_account.publicKey,
        //         associatedTokenAccount,
        //         owner,
        //         owner
        //     );

        //     const mintInstruction = await createMintToInstruction(
        //         mint_account.publicKey,
        //         associatedTokenAccount,
        //         owner,
        //         quantity * 10 ** decimals
        //     );


        //     const MetadataInstruction = createCreateMetadataAccountV3Instruction(
        //         {
        //             metadata: metadataPDA,
        //             mint: mint_account.publicKey,
        //             mintAuthority: owner,
        //             payer: owner,
        //             updateAuthority: owner,
        //         },
        //         {
        //             createMetadataAccountArgsV3: args,
        //         }
        //     );

        //     console.log("confirming");
        //     if (owner == null) {
        //         console.log("Wallet not connected");
        //         return;
        //     }
    
        //     console.log("Wallet public key:", owner.toBase58());
    
        //     // Check wallet balance
        //     const balance = await connection.getBalance(owner);
        //     console.log("Wallet balance:", balance);
    
        //     // Create transaction
        //     const createAccountTransaction = new Transaction().add(
        //         createMintAccountInstruction,
        //         InitMint,
        //         createATAInstruction,
        //         mintInstruction,
        //         MetadataInstruction
        //     );
    
        //     // Get latest blockhash
        //     const { blockhash } = await connection.getLatestBlockhash("finalized");
        //     createAccountTransaction.recentBlockhash = blockhash;
        //     createAccountTransaction.feePayer = owner;
        //     console.log("Sending transaction...");
        //     try {
        //         const createAccountSignature = await wallet.sendTransaction(
        //             createAccountTransaction,
        //             connection,
        //             { signers: [mint_account] }
        //         );
        //         console.log("createAccountSignature ===>", createAccountSignature);
    
        //         // Confirm transaction
        //         console.log("Confirming transaction...");
        //         const createAccountConfirmed = await connection.confirmTransaction(createAccountSignature, 'confirmed');
        //         console.log("Transaction confirmed:", createAccountConfirmed);
    
        //         if (createAccountConfirmed) {
        //             console.log("Mint account public key:", mint_account.publicKey.toBase58());
        //             return mint_account.publicKey;
        //         }
        //     } catch (sendError) {
        //         console.error("Error sending transaction:", sendError);
        //         if (sendError instanceof Error) {
        //             console.error("Error message:", sendError.message);
        //             console.error("Error stack:", sendError.stack);
        //         }
        //         return undefined;
        //     }
        // }

    catch (error) {
        console.log("error: ", error);
    }

}