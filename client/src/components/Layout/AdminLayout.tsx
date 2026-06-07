import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatPanel from '../Chat/ChatPanel';

export default function AdminLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, var(--atmo-bg-start) 0%, var(--atmo-bg-mid) 50%, var(--atmo-bg-end) 100%)',
    }}>
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
