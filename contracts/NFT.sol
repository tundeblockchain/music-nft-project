// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface INFTMarket {
   function createMarketItemFromNFT(address nftContract, uint256 tokenID, uint256 price, address minter) external payable;
}

contract NFT is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;
    address private contractAddress;
    INFTMarket private nftMarket;
    address private owner;
    string private _albumCoverURI;

    modifier onlyOwner(){
        require(msg.sender == owner, "untrusted message sender");
        _;
    }

    constructor(string memory name, address marketPlaceAddress, address ownerContract, string memory albumCoverURI) ERC721(name, name){
        owner = ownerContract;
        contractAddress = marketPlaceAddress;
        _albumCoverURI = albumCoverURI;
    }

    // Create tokens for all songs
    function createSongTokens(string[] memory metaDataURIs) public {
        for (uint i = 0; i < metaDataURIs.length; i++){
            createToken(metaDataURIs[i]);
        }
    }

    // Create Token which represents song in nft collection
    function createToken(string memory tokenURI) public returns (uint256 newItemId){
        _tokenIDs.increment();
        newItemId = _tokenIDs.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        // setApprovalForAll(owner, true);
        nftMarket = INFTMarket(contractAddress);
        nftMarket.createMarketItemFromNFT(address(this), newItemId, 0, msg.sender);
    }

    // Returns total songs in album
    function getTotalTokens() public view returns (uint256 totalTokens){
        return _tokenIDs.current();
    }

    function getSongsFromAlbum() public view returns(string[] memory){
        uint totalTokens = _tokenIDs.current();
        string[] memory tokenURIs = new string[](totalTokens);
        for (uint i = 1; i <= _tokenIDs.current(); i++){
            tokenURIs[i - 1] = tokenURI(i);
        }

        return tokenURIs;
    }
}