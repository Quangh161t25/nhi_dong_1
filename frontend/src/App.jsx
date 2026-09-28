import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import TemperatureForm from './components/TemperatureForm';
import { fetchUsers, fetchCabinets } from './services/googleSheets';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [dsTu, setDsTu] = useState([]);

  // Load initial Google Sheets data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingUsers(true);
      try {
        const [users, cabinets] = await Promise.all([
          fetchUsers().catch((err) => {
            console.error('Lỗi nạp DSNV:', err);
            return [];
          }),
          fetchCabinets().catch((err) => {
            console.error('Lỗi nạp DS_TU:', err);
            return [];
          }),
        ]);

        if (isMounted) {
          setUsersList(users);
          setDsTu(cabinets);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu khởi tạo:', err);
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('erp_user_session', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_user_session');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen">
      {!currentUser ? (
        <LoginScreen
          onLogin={handleLogin}
          isLoadingUsers={isLoadingUsers}
          usersList={usersList}
        />
      ) : (
        <div className="flex flex-col min-h-screen">
          <Header currentUser={currentUser} onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">
            <TemperatureForm dsTu={dsTu} currentUser={currentUser} />
          </main>
        </div>
      )}
    </div>
  );
}
