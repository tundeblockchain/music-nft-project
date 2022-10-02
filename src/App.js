import './App.css';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Home from './pages/home';
import Album from './pages/Album';
import CreateAlbum from './pages/CreateAlbum';
import AudioPlayer from './components/AudioPlayer';
import { Layout } from 'antd';
import Spotify from './images/Spotify.png';
import { SearchOutlined, DownCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
const { Footer, Sider, Content } = Layout;

function App() {
  const [nftAlbum, setNftAlbum] = useState();

  return (
    <Router>
      <Layout>
        <Layout>
          <Sider width={300} className='sideBar'>
            <img src={Spotify} alt='Logo' className='logo'></img>
            <div className='searchBar'>
              <span>Search</span>
              <SearchOutlined style={{fontSize: '30px'}}></SearchOutlined>
            </div>
            <Link to='/'>
              <p style={{color: '#1D5954'}}>Home</p>
            </Link>
            <Link to='/'>
              <p style={{color: 'white'}}>Your Music</p>
            </Link>
            <Link to='/create'>
              <p style={{color: 'white'}}>Create Album</p>
            </Link>
            <div className='recentPlayed'>
              <p className='recentTitle'>RECENTLY PLAYED</p>
              <div className='install'>
                <span>Install App</span>
                <DownCircleOutlined style={{ fontSize: '30px' }}></DownCircleOutlined>
              </div>
            </div>
          </Sider>
          <Content className='contentWindow'>
            <Routes>
              <Route path='/' element={<Home />}></Route>
              <Route path='/album' element={<Album setNftAlbum={setNftAlbum} />}></Route>
              <Route path='/create' element={<CreateAlbum />}></Route>
            </Routes>
          </Content>
        </Layout>
        <Footer className='footer'>{nftAlbum && 
        <AudioPlayer nftAlbum={nftAlbum}/>}
          
        </Footer>
      </Layout>
      
    </Router>
    
  );
}

export default App;
