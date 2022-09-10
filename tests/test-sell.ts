import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { AnchorMintSellNft } from "../target/types/anchor_mint_sell_nft";
import {
    createKeypairFromFile,
} from './util';
describe("sell-nft", async () => {

    const buyerTestPublicKey = "9zENHeU2XH6AX73XY5zwEWGTV3A92zYFH31bSxmucBsY";
    const provider = anchor.AnchorProvider.env()
    const wallet = provider.wallet as anchor.Wallet;
    anchor.setProvider(provider);

    // ** Comment this to use solpg imported IDL **
    const program = anchor.workspace.AnchorMintSellNft as anchor.Program<AnchorMintSellNft>;


    it("Sell!", async () => {

        // Testing constants

        const saleAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;
        const mint: anchor.web3.PublicKey = new anchor.web3.PublicKey(
            "5WJ8DKqivK2KyMpC37TNqEKSzfc3jwaPAhnk1ART5Yoh"
        );
        const buyer: anchor.web3.Keypair = await createKeypairFromFile(__dirname + "/tests/keypairs/buyer1.json");
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
        console.log(`Request to sell NFT: ${mint} for ${saleAmount} lamports.`);
        console.log(`Owner's Token Address: ${ownerTokenAddress}`);
        console.log(`Buyer's Token Address: ${buyerTokenAddress}`);

        // Transact with the "sell" function in our on-chain program

        await program.methods.sell(
            new anchor.BN(saleAmount)
        )
            .accounts({
                mint: mint,
                ownerTokenAccount: ownerTokenAddress,
                ownerAuthority: wallet.publicKey,
                buyerTokenAccount: buyerTokenAddress,
                buyerAuthority: buyer.publicKey,
            })
            .signers([buyer])
            .rpc();
    });
});