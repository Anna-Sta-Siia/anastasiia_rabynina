import Header from '../Header'
import Footer from '../Footer';
import { Outlet } from 'react-router-dom';

export default function Layout({ phase }) {
  return (
    <>
      <Header className={phase !== 'app' ? 'hidden' : ''} />
      <Outlet />
      <Footer className={phase !== 'app' ? 'hidden' : ''} />
    </>
  );
}
