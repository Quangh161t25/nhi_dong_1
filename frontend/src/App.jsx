import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ErpLayout from './components/ErpLayout';
import ErpHome from './components/ErpHome';
import DataModule from './components/DataModule';
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

  // Determine initial route from URL path
  const getInitialRoute = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('data')) return 'data';
    if (path.includes('form')) return 'form';
    // Default to 'trang_chu' for /trang_chu or root /
    return 'trang_chu';
  };

  const [activeRoute, setActiveRoute] = useState(getInitialRoute);
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [dsTu, setDsTu] = useState([]);

  // Sync route with URL history
  const navigateTo = (route) => {
    setActiveRoute(route);
    let targetPath = '/trang_chu';
    if (route === 'data') targetPath = '/data';
    else if (route === 'form') targetPath = '/form';
    else if (route === 'tong_quan') targetPath = '/tong-quan';
    else if (route === 'tai_chinh') targetPath = '/tai-chinh';
    else if (route === 'he_thong') targetPath = '/he-thong';
    else if (route === 'ban_quyen') targetPath = '/thong-tin-ban-quyen';

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    switch (activeRoute) {
      case 'data':
        return ['Dữ liệu nhiệt độ (DATA)'];
      case 'form':
        return ['Biểu mẫu ghi nhận'];
      case 'tong_quan':
        return ['Tổng quan'];
      case 'tai_chinh':
        return ['Tài chính'];
      case 'he_thong':
        return ['Hệ thống'];
      case 'ban_quyen':
        return ['Thông tin bản quyền'];
      default:
        return [];
    }
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isLoadingUsers={isLoadingUsers}
        usersList={usersList}
      />
    );
  }

  return (
    <ErpLayout
      activeRoute={activeRoute}
      onRouteChange={navigateTo}
      currentUser={currentUser}
      onLogout={handleLogout}
      breadcrumbs={getBreadcrumbs()}
    >
      {activeRoute === 'trang_chu' && (
        <ErpHome
          currentUser={currentUser}
          onNavigate={(target) => navigateTo(target)}
        />
      )}

      {activeRoute === 'data' && (
        <DataModule
          onBack={() => navigateTo('trang_chu')}
          onOpenForm={() => navigateTo('form')}
        />
      )}

      {activeRoute === 'form' && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateTo('data')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Xem toàn bộ bảng dữ liệu (Sheet DATA)
            </button>
          </div>
          <TemperatureForm dsTu={dsTu} currentUser={currentUser} />
        </div>
      )}

      {['tong_quan', 'tai_chinh', 'he_thong', 'ban_quyen'].includes(
        activeRoute
      ) && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <span className="text-2xl font-black">ℹ</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            Module {activeRoute.replace('_', ' ')}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Phân hệ đang trong quá trình kết nối dữ liệu. Bạn có thể sử dụng đầy đủ
            chức năng tại phân hệ{' '}
            <button
              onClick={() => navigateTo('data')}
              className="font-bold text-blue-600 hover:underline"
            >
              Dữ liệu nhiệt độ (DATA)
            </button>{' '}
            hoặc{' '}
            <button
              onClick={() => navigateTo('trang_chu')}
              className="font-bold text-blue-600 hover:underline"
            >
              Trang chủ
            </button>
            .
          </p>
        </div>
      )}
    </ErpLayout>
  );
}
