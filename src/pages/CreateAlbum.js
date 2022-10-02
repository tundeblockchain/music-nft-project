import React, { useState } from 'react';
import './CreateAlbum.css';
import { PlusOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Button,
  InputNumber,
  Upload,
} from 'antd';
import { Table, Alert, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { create as ipfsHttpClient} from 'ipfs-http-client';
import {Buffer} from 'buffer';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import Market from '../contracts/NFTMarket.json';
import NFT from '../contracts/NFT.json'
const { TextArea } = Input;

const CreateAlbum = () => {
    const auth = 'Basic ' + Buffer.from(process.env.REACT_APP_IPFSPROJECTID + ':' + process.env.REACT_APP_IPFSPROJECTSECRET).toString('base64');
    const [songs, setSongs] = useState([]);
    const [songsUri, setSongsUri] = useState([]);
    const [albumTitle, setAlbumTitle] = useState("");
    const [albumUrl, setAlbumUrl] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [artist, setArtist] = useState("");
    const [year, setYear] = useState(0);
    const [loadingState, setLoadingState] = useState(false);
    const [loadingState2, setLoadingState2] = useState(false);
    
    const [songTitle, setSongTitle] = useState("");
    const [songDuration, setDuration] = useState(0);

    const [showFirstSuccessMsg, setFirstTransactionSuccess] = useState(false);
    const [showSecondSuccessMsg, setSecondTransactionSuccess] = useState(false);
    const [transactionRejected, setTransactionRejected] = useState(false);
    const [showUserInputValidation, setUserInputValidation] = useState(false);

    const [albumTitleStatus, setAlbumTitleStatus] = useState("");
    const [artistStatus, setArtistStatus] = useState("");
    const [albumCoverStatus, setAlbumCoverStatus] = useState("");
    const [songTitleStatus, setSongTitleStatus] = useState("");

    const client = ipfsHttpClient({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });

    // Upload image to ipfs server
    async function onChangeAlbumArt(info){
        const file = info.file.originFileObj;
        try {
            setLoadingState(true);
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log('received: ${prog}')
                }
            )

            const url = process.env.REACT_APP_IPFSDEDICATED + added.path;
            setAlbumUrl(url);
        }catch(e){
            console.log(e);
        }
        setLoadingState(false);
    }

    function checkInputStatus(){
        if (albumTitle.length > 0)
            setAlbumTitleStatus('');
        else
            setAlbumTitleStatus('error');

        if (artist.length > 0)
            setArtistStatus('');
        else
            setArtistStatus('error');

        if (songTitle.length > 0)
            setSongTitleStatus('');
        else
            setSongTitleStatus('error');

        if (albumUrl.length > 0)
            setAlbumCoverStatus('');
        else
            setAlbumCoverStatus('error');

        if (albumTitleStatus === 'error' || artistStatus === 'error' || songTitleStatus === 'error' || albumCoverStatus === 'error'){
            setUserInputValidation(true);
            return false;
        }else{
            setUserInputValidation(false);
            return true;
        }
    }

    function dummyRequest({file, onSuccess}){
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    }

    // Upload song onto IPFS server
    async function onChangeMusicFile(info){
        const file = info.file.originFileObj;
        setLoadingState2(true);
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log('received: ${prog}')
                }
            )
            const url = process.env.REACT_APP_IPFSDEDICATED + added.path;
            setAudioUrl(url);
        }catch(e){
            console.log(e);
        }
        setLoadingState2(false);
    }

    // Uploads album info to IPFS server
    async function createAlbumItem(){
        setLoadingState2(true);
        let data = {
            title: albumTitle,
            image: albumUrl
        }
        data = JSON.stringify(data);

        try{
            const added = await client.add(data);
            const url = process.env.REACT_APP_IPFSDEDICATED + added.path;
            createSongs();
        }catch(e){
            console.log(e);
        }
        setLoadingState2(false);
    }

    async function createSongs(){
        for (let i = 0; i < songs.length; i++){
            let data = JSON.stringify(songs[i]);
            try{
                const added = await client.add(data);
                const url = process.env.REACT_APP_IPFSDEDICATED + added.path;
                songsUri.push(url);
                console.log('Song Detail:', url);
                setSongsUri(songsUri);
            }catch(e){
                console.log(e);
            }
        }

        try{
            createNFT();
        }catch(nftError){
            console.log(nftError);
        }
    }

    // Create NFT collection for album
    // 1st Transaction creates empty NFT collection
    // 2nd Transaction Adds songs to NFT collection
    async function createNFT(){
        setFirstTransactionSuccess(false);
        setSecondTransactionSuccess(false);
        setTransactionRejected(false);
        const web3Modal = new Web3Modal();
        web3Modal.clearCachedProvider();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();
        let contract = new ethers.Contract(process.env.REACT_APP_NFTMARKETADDRESS, Market.abi, signer);
        try {
            let transaction = await contract.createNFTAlbumContract(albumTitle, albumUrl);
            let tx = await transaction.wait();
            let event = tx.events[0];
            let nftContractAddress = event.args[2];
            console.log(nftContractAddress);
            setFirstTransactionSuccess(true);
            let nftContract = new ethers.Contract(nftContractAddress, NFT.abi, signer);
            let newTokensTransaction = await nftContract.createSongTokens(songsUri);
            let newSongsTx = await newTokensTransaction.wait();
            setFirstTransactionSuccess(false);
            setSecondTransactionSuccess(true);
        }catch(err){
            console.log(err);
            setTransactionRejected(true);
        }
        
    }

    const columns: ColumnsType<DataType> = [
        {
          title: 'Title',
          dataIndex: 'name',
        },
        {
          title: 'Duration',
          dataIndex: 'duration',
        }
      ];

      const setSong = () => {
        let statusResult = checkInputStatus();
        if (statusResult){
            let newSong = {
                image: albumUrl,
                album: albumTitle,
                artist: artist,
                year: year,
                name: songTitle,
                duration: songDuration,
                animation_url: audioUrl,
            }
            songs.push(newSong);
            console.log(songs);
            setSongs([...songs]);
        }
      }
    return (
        <div>
            <h1 className='featuredTitle'>Create Album</h1>
            <h2 className='featuredTitle2'>Add Album Info</h2>
            <div className='content'>
                <Form
                    labelCol={{ span: 0 }}
                    wrapperCol={{ span: 30 }}
                    layout="horizontal"
                    className='pb-12 border-gray-200'
                >
                    {loadingState && 
                        <Form.Item>
                            <Spin />
                        </Form.Item>
                    }
                    <Form.Item>
                        <Input status={albumTitleStatus} className='pb' placeholder='Album Title' onChange={(e) => setAlbumTitle(e.target.value)} />
                    </Form.Item>
                    <Form.Item className='formLabel'>
                        <Input status={artistStatus} className='pb' placeholder='Artist' onChange={(e) => setArtist(e.target.value)} />
                    </Form.Item>
                    <Form.Item className='formLabel'>
                        <InputNumber className='pb' placeholder='Year' onChange={(e) => setYear(e)} />
                    </Form.Item>
                    <Form.Item className='formLabel' valuePropName="fileList">
                        <Upload status={albumCoverStatus} customRequest={(info) => dummyRequest(info)} multiple={false} maxCount='1' listType="picture-card" onChange={(value) => onChangeAlbumArt(value)} >
                            <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Album Cover</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    {/* <Form.Item className='formLabel'>
                        <Button>Create Album</Button>
                    </Form.Item> */}
                </Form>
            </div>
            <h2 className='featuredTitle2'>Add Songs</h2>
            <div className='content'>
                <Form
                    labelCol={{ span: 0 }}
                    wrapperCol={{ span: 30 }}
                    layout="horizontal"
                    className='pb-12 border-gray-200'
                >
                    {loadingState2 && 
                        <Form.Item>
                            <Spin />
                        </Form.Item>
                    }
                    {showUserInputValidation && 
                        <Form.Item>
                            <Alert
                                message="Please fill in all the information missing"
                                type="error"
                                showIcon
                            />
                        </Form.Item>
                    }
                    {transactionRejected && 
                        <Form.Item>
                            <Alert
                                message="Transaction Rejected: Please try again"
                                type="error"
                                showIcon
                                closable
                            />
                        </Form.Item>
                    }
                    {showFirstSuccessMsg && 
                        <Form.Item>
                            <Alert
                                message="1/2 Transations Completed"
                                description="One more transaction left to complete the album release"
                                type="success"
                                showIcon
                            />
                        </Form.Item>
                    }
                    {showSecondSuccessMsg && 
                        <Form.Item>
                            <Alert
                                message="Album Created Yay!!!"
                                description="2/2 Transactions completed:"
                                type="success"
                                showIcon
                            />
                        </Form.Item>
                    }
                    <Form.Item>
                        <Input status={songTitleStatus} className='pb' placeholder='Song Title' onChange={(e) => setSongTitle(e.target.value)} />
                    </Form.Item>
                    <Form.Item>
                        <InputNumber className='pb' placeholder='Duration in seconds' onChange={(e) => setDuration(e)} />
                    </Form.Item>
                    <Form.Item className='formLabel' valuePropName="fileList">
                        <Upload customRequest={(info) => dummyRequest(info)} multiple={false} maxCount='1' accept='.mp3,.wav,.aac,.flac' listType="picture-card" onChange={(value) => onChangeMusicFile(value)} >
                            <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Song File</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    <Form.Item className='formLabel'>
                    <React.StrictMode>
                        <Button onClick={setSong} >Add Song to Album</Button>
                    </React.StrictMode>
                    </Form.Item>
                    <Form.Item className='formLabel'>
                        <Button onClick={createAlbumItem} >Create Album</Button>
                    </Form.Item>
                </Form>
            </div>
            <h2 className='featuredTitle2'>Song Listing</h2>
            <div>
                <Table columns={columns} dataSource={songs} size="middle" />
            </div>
        </div>
    );
}

export default CreateAlbum;