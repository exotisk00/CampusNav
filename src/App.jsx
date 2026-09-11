import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import LostFound from './pages/LostFound';
import PostItem from './pages/PostItem';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Notifications from './pages/Notifications';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import LanguageSettings from './pages/LanguageSettings';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Public / Auth Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Authenticated / Student Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/lost-found/post" element={<PostItem />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/language" element={<LanguageSettings />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
