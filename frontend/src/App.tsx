import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { initializeAuth } from './stores/authStore';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ShopPage } from './pages/shop/ShopPage';
import { CosmeticsPage } from './pages/cosmetics/CosmeticsPage';
import { CosmeticDetailPage } from './pages/cosmetics/CosmeticDetailPage';
import { NewItemsPage } from './pages/cosmetics/NewItemsPage';
import { OnSalePage } from './pages/cosmetics/OnSalePage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { WishlistPage } from './pages/WishlistPage';
import { StatsPage } from './pages/StatsPage';
import { ROUTES } from './constants';
import { useEffect } from 'react';

// Inicializar autenticação do localStorage
initializeAuth();

function App() {
  useEffect(() => {
    // Adicionar classe dark ao html se necessário
    const isDark = localStorage.getItem('fortnite_theme') === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas sem Layout */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          {/* Rotas com Layout */}
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path={ROUTES.HOME} element={<HomePage />} />

                  {/* Rotas protegidas */}
                  <Route
                    path={ROUTES.PROFILE}
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.WISHLIST}
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rotas públicas */}
                  <Route path={ROUTES.SHOP} element={<ShopPage />} />
                  <Route path={ROUTES.COSMETICS} element={<CosmeticsPage />} />
                  <Route path={ROUTES.COSMETIC_DETAIL} element={<CosmeticDetailPage />} />
                  <Route path={ROUTES.NEW_ITEMS} element={<NewItemsPage />} />
                  <Route path={ROUTES.ON_SALE} element={<OnSalePage />} />
                  <Route path={ROUTES.STATS} element={<StatsPage />} />

                  {/* Rota 404 */}
                  <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
