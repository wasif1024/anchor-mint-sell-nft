use anchor_lang::prelude::*;
pub mod mint;
pub mod sell;
pub mod mint_spl_token;

use mint::*;
use sell::*;
use mint_spl_token::*;

declare_id!("BPoaUKQYHasHr1Zx4ZLLTTMqezWbKKTgBFZv9LDK8drZ");

#[program]
pub mod anchor_mint_sell_nft {
    use super::*;

    pub fn mint(
        ctx: Context<MintNft>, 
        metadata_title: String, 
        metadata_symbol: String, 
        metadata_uri: String,supply:u64
    ) -> Result<()> {
        mint::mint(
            ctx,
            metadata_title,
            metadata_symbol,
            metadata_uri,supply,
        )
    }
    pub fn minttoken(
        ctx: Context<MintToken>, 
        supply:u64
    ) -> Result<()> {
        mint_spl_token::minttoken(
            ctx,supply
        )
    }
    pub fn sell(
        ctx: Context<SellNft>,
        sale_lamports: u64,amount_transfer:u64
    ) -> Result<()> {
        sell::sell(
            ctx,
            sale_lamports,amount_transfer
        )
    }
}

