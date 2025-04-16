import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/header';

export const Layout = () => {
  return (
    <>
      <header>
        <Header />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};
