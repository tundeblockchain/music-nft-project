const NFTMarket = artifacts.require("NFTMarket");
const NFT = artifacts.require("NFT");
module.exports = function (deployer) {
  deployer.deploy(NFTMarket);
};
