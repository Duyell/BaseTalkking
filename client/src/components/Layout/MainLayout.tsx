import { Outlet } from 'react-router-dom';
import Header from './Header';
import ChatPanel from '../Chat/ChatPanel';

export default function MainLayout() {
  return (
    <div className="app-main-bg" style={{ minHeight: '100vh' }}>
      <Header />
      <main>
        <Outlet />
      </main>
      <ChatPanel />
    </div>
  );
}
