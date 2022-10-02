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

    useEffect(() => {
        loadNFTs();
    }, [value]);

    // Load all NFT albums on the home screen
    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
        const marketContract = new ethers.Contract(process.env.REACT_APP_NFTMARKETADDRESS, Market.abi, provider);
        try {
          const data = await marketContract.fetchAlbums();
          console.log(data);
          const items = await Promise.all(data.map(async i => {
            let item = {
              image: i.albumCoverURI,
              title: i.albumName,
              contract: i.nftContract
            }
            return item;
          }))
          
          setAlbums(items);
          console.log(albums);
          setLoadingState('loaded');
        }catch(err){
          console.log(err);
        }
        
      }

    return (
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

    )
}

export default Home;