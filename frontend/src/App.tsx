import ChatDetail from './chat/ChatDetail';
import ChatList from './chat/ChatList';
import ThemeSwitcher from './components/ThemeSwitcher';
import Particles from './components/ui/particles';
import { ChatProvider } from './context/ChatProvider';
import { ThemeProvider } from './context/ThemeProvider';

import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-card">
      {/* <DotPattern
        className={cn(
          "dot-pattern-mask"
          // "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      /> */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={500}
        ease={80}
        color={'#A07CFE'} //TODO: With Variable
        refresh
      />
      {/* <div className='z-[1]'>
                <Ripple />
            </div> */}
      <div className="z-[2]">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <ThemeSwitcher />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ChatList />} />
              <Route path=":chatId" element={<ChatDetail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
