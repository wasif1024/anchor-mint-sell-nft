import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { AnchorMintSellNft } from "../target/types/anchor_mint_sell_nft";

describe("anchor-mint-sell-nft", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    const wallet = provider.wallet as anchor.Wallet;
    anchor.setProvider(provider);

    const program = anchor.workspace.AnchorMintSellNft as Program<AnchorMintSellNft>;

    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );


    it("Mint!", async () => {

        // Derive the mint address and the associated token account address

        const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
        const tokenAddress = await anchor.utils.token.associatedAddress({
            mint: mintKeypair.publicKey,
            owner: wallet.publicKey
        });
        console.log(`New token: ${mintKeypair.publicKey}`);

        // Transact with the "mint" function in our on-chain program

        await program.methods.minttoken(
            new anchor.BN(100)
        )
            .accounts({
                mint: mintKeypair.publicKey,
                tokenAccount: tokenAddress,
                mintAuthority: wallet.publicKey,
            })
            .signers([mintKeypair])
            .rpc();
    });
});