import React from 'react'
import './AudioPlayer.css';
import { Slider } from 'antd';
import { SoundOutlined, StepBackwardOutlined, StepForwardOutlined, PlayCircleFilled, PauseCircleFilled } from "@ant-design/icons";
import { useIPFS } from '../hooks/useIPFS';
import useAudio from '../hooks/useAudio';


function AudioPlayer({nftAlbum}){
    const {resolveLink} = useIPFS();
    const [playing, duration, toggle, toNextTrack, toPrevTrack, trackProgress, onSearch, onSearchEnd, onVolume, trackIndex] = useAudio(nftAlbum);

    const minSec = (secs) => {
        const minutes = Math.floor(secs / 60);
        const returnMin = minutes < 10 ? '0' + minutes: minutes;
        const seconds = Math.floor(secs % 60);
        const returnSec = seconds < 10 ? '0' + seconds: seconds;
        let timeString = returnMin + ':' + returnSec;
        return timeString;
    }
    return (
        <>
            <div className='buttons' style={{width: '300px', justifyContent:'start'}}>
                <img className='cover' src={nftAlbum[trackIndex].image} alt='currentCover' />
                <div>
                    <div className='songTitle'>{nftAlbum[trackIndex].name}</div>
                    <div className='songAlbum'>{nftAlbum[trackIndex].album}</div>
                </div>
            </div>
            <div>
                <div className='buttons'>
                    <StepBackwardOutlined className='forback' onClick={toPrevTrack}/>
                    {playing ? 
                        <PauseCircleFilled className='pauseplay' onClick={toggle} /> :
                        <PlayCircleFilled className='pauseplay' onClick={toggle} />
                    }
                    <StepForwardOutlined className='forback' onClick={toNextTrack}/>
                </div>
                <div className='buttons'>
                    {minSec(trackProgress)}
                    <Slider 
                        value={trackProgress}
                        className='progress'
                        step={1}
                        min={0}
                        max={duration ? duration : 0}
                        tooltipVisible={false}
                        onChange={(value) => onSearch(value)}
                        onAfterChange={onSearchEnd}
                    />
                    {duration ? minSec(Math.round(duration)) : '00:00'}
                </div>
            </div>
            <div className='soundDiv'>
                <SoundOutlined />
                <Slider 
                    defaultValue={100}
                    className='volume'
                    tooltipVisible={false}
                    onChange={(value) => onVolume(value / 100)}
                />
            </div>
        </>
    )
}

export default AudioPlayer;