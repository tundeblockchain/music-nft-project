import { ethers } from 'ethers';
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs } from 'antd';
import './home.css';
import { library  } from '../helpers/albumList';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import NFT from '../contracts/NFT.json';
import Market from '../contracts/NFTMarket.json';

const { TabPane } = Tabs;



const Home = () => {
    const [albums, setAlbums] = useState([]);
    const [value, setValue] = useState('initial');
    const [loadingState, setLoadingState] = useState('not-loaded');
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

    useEffect(() => {
        loadNFTs(); 
    }, [value]);

    const isPolygonTestnet = async () => {
        const chainId = 80001 // Polygon Testnet

        if (window.ethereum.networkVersion != chainId) {
            console.log(window.ethereum.networkVersion)
            return false;
        }

        return true;
    }

    // Load all NFT albums on the home screen
    async function loadNFTs() {
        const web3Modal = new Web3Modal();
        web3Modal.clearCachedProvider();
        const connection = await web3Modal.connect();
        let correctNetwork = await isPolygonTestnet();
        console.log(correctNetwork);
        setIsCorrectNetwork(correctNetwork);
        const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
        const marketContract = new ethers.Contract(process.env.REACT_APP_NFTMARKETADDRESS, Market.abi, provider);
        try {
            const data = await marketContract.fetchAlbums();
            const items = await Promise.all(data.map(async i => {
            let item = {
                image: i.albumCoverURI,
                title: i.albumName,
                contract: i.nftContract
            }
            return item;
            }))
            
            setAlbums(items);
            console.log(items)
            setLoadingState('loaded');
        }catch(err){
            console.log(err);
        }
      }

    return (
        <>
            {!isCorrectNetwork && 
                <h1 className='featuredTitle'>Please Connect to Polygon Testnet</h1>
            }
            {isCorrectNetwork && 
                <Tabs>
                    <TabPane tab="FEATURED" key="1">
                        <h1 className='featuredTitle'>Today Is The Day</h1>
                        <div className='albums'>
                            {albums.map((e) => (
                                <Link to='/album' state={e} className='albumSelection'>
                                    <img
                                        src={e.image}
                                        alt='bull'
                                        style={{ width: '150px', marginBottom: '10px'}}
                                    ></img>
                                    <p>{e.title}</p>
                                </Link>
                            ))}
                        </div>
                    </TabPane>
                    <TabPane tab="GENRES" key="2">
                        <h1 className='featuredTitle'>Pop Hits</h1>
                        <div className='albums'>
                            {albums.slice(7,13).map((e) => (
                                <Link to='/album' state={e} className='albumSelection'>
                                    <img
                                        src={e.image}
                                        alt='bull'
                                        style={{ width: '150px', marginBottom: '10px'}}
                                    ></img>
                                    <p>{e.title}</p>
                                </Link>
                            ))}
                        </div>
                    </TabPane>
                    <TabPane tab="NEW RELEASES" key="3">
                        <h1 className='featuredTitle'>Classics</h1>
                        <div className='albums'>
                            {albums.slice(0,6
                            ).map((e) => (
                                <Link to='/album' state={e} className='albumSelection'>
                                    <img
                                        src={e.image}
                                        alt='bull'
                                        style={{ width: '150px', marginBottom: '10px'}}
                                    ></img>
                                    <p>{e.title}</p>
                                </Link>
                            ))}
                        </div>
                    </TabPane>
                </Tabs>
            }
            
        </>
        
        

    )
}

export default Home;