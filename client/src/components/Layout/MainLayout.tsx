import { Outlet } from 'react-router-dom';
import Header from './Header';
import ChatPanel from '../Chat/ChatPanel';

export default function MainLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(170deg, var(--atmo-bg-start) 0%, var(--atmo-bg-mid) 50%, var(--atmo-bg-end) 100%)',
      }}
    >
      <Header />
      <main>
        <Outlet />
      </main>
      <ChatPanel />
    </div>
  );
}
