import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createInitializeMintInstruction,
    getOrCreateAssociatedTokenAccount

} from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { AnchorMintSellNft } from "../target/types/anchor_mint_sell_nft";
import {
    createKeypairFromFile,
} from './util';
describe("sell-nft", async () => {

    const buyerTestPublicKey = "9zENHeU2XH6AX73XY5zwEWGTV3A92zYFH31bSxmucBsY";
    const provider = anchor.AnchorProvider.env()
    const wallet = provider.wallet as anchor.Wallet;
    const treasuryWallet = provider.wallet as anchor.Wallet;
    anchor.setProvider(provider);

    // ** Comment this to use solpg imported IDL **
    const program = anchor.workspace.AnchorMintSellNft as anchor.Program<AnchorMintSellNft>;


    it("Sell!", async () => {

        // Testing constants
        const rewardAmount = 5;
        const saleAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;
        const mint: anchor.web3.PublicKey = new anchor.web3.PublicKey(
            "3wuwAubmZacGTTy68ccydh789q1BAPvviAx5NiXfckWg"
        );
        const mintToken: anchor.web3.PublicKey = new anchor.web3.PublicKey(
            "4Sgh59WFWquWiVyBKK63NXFSzwwDtcpw1qCEsRT4zaXi"
        );
        const connection = new Connection(clusterApiUrl('devnet'), "confirmed");

        //getOrCreateAssociatedTokenAccount()
        /*const mint2: anchor.web3.PublicKey = new anchor.web3.PublicKey(
            "5WJ8DKqivK2KyMpC37TNqEKSzfc3jwaPAhnk1ART5Yoh"
        );
        const mintArray:anchor.web3.PublicKey[]=[];
        mintArray.push(mint);
        mintArray.push(mint2);*/
        const buyer: anchor.web3.Keypair = await createKeypairFromFile(__dirname + "/tests/keypairs/buyer1.json");

        //console.log(`Test Tokens Address: ${(await testTokenAccountAddress).address}`);
        //console.log(`Test Tokens Amount: ${(await testTokenAccountAddress).amount}`);
        console.log(`Buyer public key: ${buyer.publicKey}`);

        // Derive the associated token account address for owner & buyer

        const ownerTokenAddress = await anchor.utils.token.associatedAddress({
            mint: mint,
            owner: wallet.publicKey
        });
        const buyerTokenAddress = await anchor.utils.token.associatedAddress({
            mint: mint,
            owner: buyer.publicKey,
        });

        const ownerSplTokenAddress = await anchor.utils.token.associatedAddress({
            mint: mintToken,
            owner: treasuryWallet.publicKey
        });
        const buyerSplTokenAddressBeta = await anchor.utils.token.associatedAddress({
            mint: mintToken,
            owner: buyer.publicKey,
        });
        const buyerSplTokenAddress = getOrCreateAssociatedTokenAccount(
            connection,
            buyer,
            mintToken,
            buyer.publicKey,
        );
        const buyerAccount = await buyerSplTokenAddress;
        //const buyerSplTokenPublicKey = (await buyerSplTokenAddress).address;
        console.log(`Request to sell NFT: ${mint} for ${saleAmount} lamports.`);
        console.log(`Owner's Token Address: ${ownerTokenAddress}`);
        console.log(`Buyer's Token Address: ${buyerTokenAddress}`);
        const buyerPubKey = (await buyerSplTokenAddress).address.toBase58();
        console.log(`Buyer's Spl-Token Address: ${(await buyerSplTokenAddress).address.toBase58()}`);
        console.log(`Buyer's Spl-Token Pub Key: ${buyerPubKey}`);
        // Transact with the "sell" function in our on-chain program

        await program.methods.sell(
            new anchor.BN(saleAmount), new anchor.BN(rewardAmount)
        )
            .accounts({
                mint: mint,
                splmint: mintToken,
                ownerTokenAccount: ownerTokenAddress,
                ownerAuthority: wallet.publicKey,
                treasuryWallet: treasuryWallet.publicKey,
                buyerTokenAccount: buyerTokenAddress,
                buyerAuthority: buyer.publicKey,
                ownerSplTokenAccount: ownerSplTokenAddress,
                buyerSplTokenAccount: buyerPubKey,
            })
            .signers([buyer])
            .rpc();
    });
});