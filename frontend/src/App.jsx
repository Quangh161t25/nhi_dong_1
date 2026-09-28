import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
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

  // Rule:
  // Nếu KHÔNG CÓ path (/ hoặc rỗng) -> Mở Form nhập liệu
  // Nếu CÓ /trang_chu -> Mở Trang chủ ERP (Ảnh 1)
  // Nếu CÓ /data -> Mở Module DATA (Ảnh 2)
  const getInitialRoute = () => {
    const rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    if (rawPath === '/trang_chu' || rawPath === '/trang-chu') return 'trang_chu';
    if (rawPath === '/data') return 'data';
    if (rawPath === '/tong-quan' || rawPath === '/tong_quan') return 'tong_quan';
    if (rawPath === '/tai-chinh' || rawPath === '/tai_chinh') return 'tai_chinh';
    if (rawPath === '/he-thong' || rawPath === '/he_thong') return 'he_thong';
    if (rawPath === '/thong-tin-ban-quyen' || rawPath === '/ban_quyen') return 'ban_quyen';

    // Mặc định không có /trang_chu: Form nhập liệu
    return 'form';
  };

  const [activeRoute, setActiveRoute] = useState(getInitialRoute);
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [dsTu, setDsTu] = useState([]);

  // Sync route with URL bar
  const navigateTo = (route) => {
    setActiveRoute(route);
    let targetPath = '/';
    if (route === 'trang_chu') targetPath = '/trang_chu';
    else if (route === 'data') targetPath = '/data';
    else if (route === 'form') targetPath = '/';
    else if (route === 'tong_quan') targetPath = '/tong-quan';
    else if (route === 'tai_chinh') targetPath = '/tai-chinh';
    else if (route === 'he-thong') targetPath = '/he-thong';
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
      case 'tong_quan':
        return ['Tổng quan'];
      case 'tai_chinh':
        return ['Tài chính'];
      case 'he-thong':
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

  // 1. Nếu KHÔNG CÓ path (/): Mở FORM GHI NHẬN NHIỆT ĐỘ
  if (activeRoute === 'form') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={navigateTo}
        />
        <main className="flex-1 p-4 md:p-8">
          <TemperatureForm dsTu={dsTu} currentUser={currentUser} />
        </main>
      </div>
    );
  }

  // 2. Nếu CÓ /trang_chu hoặc /data hoặc phân hệ ERP: Mở giao diện ERP Layout
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
            Phân hệ đang trong quá trình đồng bộ. Bạn có thể sử dụng đầy đủ chức
            năng tại phân hệ{' '}
            <button
              onClick={() => navigateTo('data')}
              className="font-bold text-blue-600 hover:underline"
            >
              Dữ liệu nhiệt độ (DATA)
            </button>{' '}
            hoặc{' '}
            <button
              onClick={() => navigateTo('form')}
              className="font-bold text-teal-600 hover:underline"
            >
              Form ghi nhận nhiệt độ (/)
            </button>
            .
          </p>
        </div>
      )}
    </ErpLayout>
  );
}
