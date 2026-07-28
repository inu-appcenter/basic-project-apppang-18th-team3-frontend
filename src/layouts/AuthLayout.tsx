import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="flex min-h-screen justify-center">
      <main className="w-full max-w-120 bg-white">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
