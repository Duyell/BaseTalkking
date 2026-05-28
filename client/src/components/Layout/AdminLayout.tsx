import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatPanel from '../Chat/ChatPanel';

export default function AdminLayout() {
  return (
    <div className="app-main-bg" style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
      <ChatPanel />
    </div>
  );
}
