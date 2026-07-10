import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import OrderHubPage from './orders/OrderHubPage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

function AppContent() {
  const { token } = useAuth();

  if (!token)
    return <LoginPage apiBaseUrl={apiBaseUrl} />;

  return <OrderHubPage apiBaseUrl={apiBaseUrl} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
