import { React } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Album.css';
import Opensea from '../images/opensea.png';
import { ClockCircleOutlined } from '@ant-design/icons';
import NFT from '../contracts/NFT.json';
import { ethers } from 'ethers';
import axios from 'axios';

const Album = ({setNftAlbum}) => {
    let {state: album} = useLocation();
    let [albumDetails, setAlbumDetails] = useState([]);
    const [value, setValue] = useState('initial');
    const [loadingState, setLoadingState] = useState(false);
    useEffect(() => {
        loadAlbum();
    }, [value]);

    // Load selected album
    async function loadAlbum() {
        setLoadingState(false);
        const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
        const nftContract = new ethers.Contract(album.contract, NFT.abi, provider);
        try {
          const data = await nftContract.getSongsFromAlbum();
          let songs = [];
          for (let i = 0; i < data.length; i++){
            let result = await axios.get(data[i]);
            songs.push(result.data);
          }
          console.log(songs);
          setAlbumDetails(songs);
        }catch(err){
          console.log(err);
        }
        setLoadingState(true);
    }

    const minSec = (secs) => {
        const minutes = Math.floor(secs / 60);
        const returnMin = minutes < 10 ? '0' + minutes: minutes;
        const seconds = Math.floor(secs % 60);
        const returnSec = seconds < 10 ? '0' + seconds: seconds;
        let timeString = returnMin + ':' + returnSec;
        return timeString;
    }

    return (
        <div>
            {loadingState &&
                <div className='albumContent'>
                    <div className='topBan'>
                        <img
                            src={album.image}
                            alt='albumcover'
                            className='albumCover'
                        ></img>
                        <div className='albumDeets'>
                            <div>ALBUM</div>
                            <div className='title'>{album.title}</div>
                            <div className='artist'>
                                {albumDetails && albumDetails[0].artist}
                            </div>
                            <div>
                                {albumDetails && albumDetails[0].year}.{" "}
                                {albumDetails && albumDetails.length} Songs
                            </div>
                        </div>
                    </div>
                    <div className='topBan'>
                        <div className='playButton' onClick={() => setNftAlbum(albumDetails)}>Play</div>
                    </div>
                    <div className='tableHeader'>
                        <div className='numberHeader'>#</div>
                        <div className='titleHeader'>TITLE</div>
                        <div className='numberHeader'>
                            <ClockCircleOutlined />
                        </div>
                    </div>
                    {albumDetails && albumDetails.map((nft, i) => {
                        return (
                            <div className='tableContent'>
                                <div className='numberHeader'>{i + 1}</div>
                                <div className='titleHeader'
                                    style={{color: 'rbg(205, 203, 203)'}}>{nft.name}
                                </div>
                                <div className='numberHeader'>{minSec(nft.duration)}</div>
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    )
}

export default Album;