import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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

const MainLayout: React.FC = () => {
  const { activeTab, selectedCaseId, toastMessage } = useCaseWatch();
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08090B] flex flex-col text-[#E8EAED] selection:bg-[#A3B86C]/30 selection:text-white">
      {/* Header with CONVERA branding & Controls */}
      <Header onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)} />

      {/* Main Body: Sidebar + Dynamic Content Pane */}
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-5 sm:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* View Routing */}
          {activeTab === 'dashboard' && <OverviewDashboard />}

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

export default function App() {
  return (
    <AuthProvider>
      <CaseWatchProvider>
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      </CaseWatchProvider>
    </AuthProvider>
  );
}
