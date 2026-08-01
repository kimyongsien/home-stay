import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FindRoomsPage from './pages/FindRoomsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RoomDetailRouter from './pages/RoomDetailRouter';
import ChooseListingTypePage from './pages/ChooseListingTypePage';
import AddEntireRoomPage from './pages/AddEntireRoomPage';
import AddSharedRoomPage from './pages/AddSharedRoomPage';
import RoommatesPage from './pages/RoommatesPage';
import AboutPage from './pages/AboutPage';

// 🆕 Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminRooms from './pages/admin/AdminRooms';           // 🆕
import AdminReports from './pages/admin/AdminReports';       // 🆕
import AdminUniversities from './pages/admin/AdminUniversities'; // 🆕
import AdminSettings from './pages/admin/AdminSettings';     // 🆕
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import EditRoomPage from './pages/EditRoomPage';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* 🆕 Admin Routes (No Navbar) */}
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="rooms" element={<AdminRooms />} />                {/* 🆕 */}
            <Route path="reports" element={<AdminReports />} />            {/* 🆕 */}
            <Route path="universities" element={<AdminUniversities />} />  {/* 🆕 */}
            <Route path="settings" element={<AdminSettings />} />          {/* 🆕 */}

          </Route>

          {/* Regular Routes (With Navbar) */}
          <Route path="/*" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Routes>
                
                <Route path="/" element={<HomePage />} />
                <Route path="/find-rooms" element={<FindRoomsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/rooms/:id" element={<RoomDetailRouter />} />
                <Route path="/add-room" element={<ChooseListingTypePage />} />
                <Route path="/add-room/entire" element={<AddEntireRoomPage />} />
                <Route path="/add-room/shared" element={<AddSharedRoomPage />} />
                <Route path="/roommates" element={<RoommatesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/edit-room/:id" element={<EditRoomPage />} />
              </Routes>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;