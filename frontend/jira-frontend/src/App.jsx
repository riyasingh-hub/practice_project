import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MainDashboard from './components/MainDashboard'
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import ChatWidget from './components/ChatWidget';

function AppShell() {
  const location = useLocation();
  const showChatWidget = location.pathname !== '/';

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/project/:projectKey" element={<Dashboard />} />
      </Routes>

      {showChatWidget && <ChatWidget />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App
