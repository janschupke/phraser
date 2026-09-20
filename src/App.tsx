import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import NotFound from './pages/NotFound';
import { ROUTES } from './routes';

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppLayout>
          <Routes>
            {ROUTES.map(route => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </Router>
    </ToastProvider>
  );
}

export default App;
