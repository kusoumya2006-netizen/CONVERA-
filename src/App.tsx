import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { CinematicLandingPage } from './components/landing/CinematicLandingPage';
import { CaseWatchProvider, useCaseWatch } from './context/CaseWatchContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { CaseFilters } from './components/registry/CaseFilters';
import { CaseTable } from './components/registry/CaseTable';
import { NewCaseModal } from './components/registry/NewCaseModal';
import { CaseDetailView } from './components/cases/CaseDetailView';
import { InstitutionList } from './components/institutions/InstitutionList';
import { OverlapMonitoringView } from './components/overlaps/OverlapMonitoringView';
import { ReportsView } from './components/reports/ReportsView';
import { CompletedCasesView } from './components/completed/CompletedCasesView';
import { MergedCasesView } from './components/merged/MergedCasesView';
import { CrossBureauIntelligenceGraph } from './components/graph/CrossBureauIntelligenceGraph';

type AppRoute = 'landing' | 'login' | 'app';

const getInitialRoute = (): AppRoute => {
  if (typeof window === 'undefined') {
    // In Node / SSR testing environment, default to 'login' to test auth gateway workflows
    return 'login';
  }
  const path = window.location.pathname;
  const hash = window.location.hash;
  if (path === '/login' || hash === '#login') return 'login';
  if (path === '/app' || hash === '#app') return 'app';
  return 'landing';
};

interface MainLayoutProps {
  onNavigateLanding?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onNavigateLanding }) => {
  const { activeTab, selectedCaseId, toastMessage } = useCaseWatch();
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08090B] flex flex-col text-[#E8EAED] selection:bg-[#A3B86C]/30 selection:text-white">
      {/* Header with CONVERA branding & Controls */}
      <Header
        onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
        onNavigateLanding={onNavigateLanding}
      />

      {/* Main Body: Sidebar + Dynamic Content Pane */}
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-5 sm:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* View Routing */}
          {activeTab === 'dashboard' && (
            <OverviewDashboard onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)} />
          )}

          {activeTab === 'registry' && (
            <div>
              {selectedCaseId ? (
                <CaseDetailView />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#E8EAED]">
                        Integrated Institution Complaint Registry
                      </h2>
                      <p className="text-xs text-[#A0A7B2]">
                        Central repository of institution grievances and regulatory proceedings across all AICTE cells.
                      </p>
                    </div>
                  </div>
                  <CaseFilters />
                  <CaseTable />
                </div>
              )}
            </div>
          )}

          {activeTab === 'institutions' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#E8EAED]">
                  Technical Institution Profiles & Consolidated History
                </h2>
                <p className="text-xs text-[#A0A7B2]">
                  Directory of AICTE approved technical colleges with consolidated cross-bureau case histories.
                </p>
              </div>
              <InstitutionList />
            </div>
          )}

          {activeTab === 'overlaps' && <OverlapMonitoringView />}

          {activeTab === 'graph' && <CrossBureauIntelligenceGraph />}

          {activeTab === 'completed' && <CompletedCasesView />}

          {activeTab === 'merged' && <MergedCasesView />}

          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Modal for Registering a New Complaint */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
      />

      {/* Live Toast Notifications */}
      <Toast message={toastMessage} />
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [route, setRoute] = useState<AppRoute>(getInitialRoute);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/login' || hash === '#login') {
        setRoute('login');
      } else if (path === '/app' || hash === '#app') {
        setRoute('app');
      } else {
        setRoute('landing');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (newRoute: AppRoute) => {
    setRoute(newRoute);
    if (typeof window !== 'undefined') {
      const targetPath = newRoute === 'landing' ? '/' : `/${newRoute}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ route: newRoute }, '', targetPath);
      }
    }
  };

  if (route === 'landing') {
    return (
      <CinematicLandingPage
        onEnterWorkspace={() => navigateTo(isAuthenticated ? 'app' : 'login')}
        onOpenLogin={() => navigateTo('login')}
      />
    );
  }

  if (route === 'login') {
    if (isAuthenticated) {
      return <MainLayout onNavigateLanding={() => navigateTo('landing')} />;
    }
    return <LoginPage onBackToLanding={() => navigateTo('landing')} />;
  }

  // route === 'app'
  return (
    <ProtectedRoute>
      <MainLayout onNavigateLanding={() => navigateTo('landing')} />
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CaseWatchProvider>
        <AppRouter />
      </CaseWatchProvider>
    </AuthProvider>
  );
}
