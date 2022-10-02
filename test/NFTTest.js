const NFT = artifacts.require("./NFT.sol");
const NFTMarket = artifacts.require("./NFTMarket.sol");

contract("MyMine", accounts => {
      it("Create Album", async () => {
        const nftMarketContract = await NFTMarket.deployed();

        let songs = [];
        songs.push(process.env.TEST_DATA);
        await nftMarketContract.createNFTAlbumContract('test', songs);
        let results = await nftMarketContract.fetchAlbums();
        console.log(results);
        // Check if there is at least 1 NFT bought from market with account 1
        expect(results.length).to.be.greaterThan(0);
      });
});