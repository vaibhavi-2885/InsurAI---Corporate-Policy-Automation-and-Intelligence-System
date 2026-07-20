import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ClaimsStudio from './pages/ClaimsStudio';
import ControlTower from './pages/ControlTower';
import CopilotPage from './pages/CopilotPage';
import CustomerPortal from './pages/CustomerPortal';
import HomePage from './pages/HomePage';
import OperationsHub from './pages/OperationsHub';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customer" element={<CustomerPortal />} />
          <Route path="/operations" element={<OperationsHub />} />
          <Route path="/claims" element={<ClaimsStudio />} />
          <Route path="/control-tower" element={<ControlTower />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
