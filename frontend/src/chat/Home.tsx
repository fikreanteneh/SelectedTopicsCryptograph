import { ChatProvider } from '@/context/ChatProvider';
import ChatDetail from './ChatDetail';
import NavBar from './NavBar';

const Home = () => {
  return (
    <ChatProvider>
      <div className="flex h-screen">
        <NavBar />
        <ChatDetail />
      </div>
    </ChatProvider>
  );
};

export default Home;
