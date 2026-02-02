import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Restaurant menu by slug */}
        <Route path="/:slug" element={<RestaurantRoute />} />

        {/* Default redirect to HavaJava */}
        <Route path="/" element={<Navigate to="/havajava" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function RestaurantRoute() {
  const slug = window.location.pathname.split('/')[1];
  return <MenuPage slug={slug} />;
}

export default App;
