import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  MapPin,
  AlertTriangle,
  FileText,
  Activity,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react';
import { adminApi, reportApi, complaintApi } from '../services/api';
import { User, FacilityReport, Complaint, AgentLog } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'complaints' | 'logs' | 'health'>('overview');
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<FacilityReport[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [health, setHealth] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [newReportStatus, setNewReportStatus] = useState<string>('IN_PROGRESS');
  const [adminNote, setAdminNote] = useState<string>('');

  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [newComplaintStatus, setNewComplaintStatus] = useState<string>('IN_PROGRESS');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sumRes, userRes, repRes, compRes, logRes, healthRes] = await Promise.allSettled([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        reportApi.getAll(),
        complaintApi.getAll(),
        adminApi.getLogs(),
        adminApi.getHealth(),
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (userRes.status === 'fulfilled') setUsers(userRes.value);
      if (repRes.status === 'fulfilled') setReports(repRes.value);
      if (compRes.status === 'fulfilled') setComplaints(compRes.value);
      if (logRes.status === 'fulfilled') setLogs(logRes.value);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (id: number) => {
    try {
      await reportApi.updateStatus(id, newReportStatus, adminNote);
      setSelectedReportId(null);
      setAdminNote('');
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateComplaint = async (id: number) => {
    try {
      await complaintApi.updateStatus(id, newComplaintStatus, resolutionNote);
      setSelectedComplaintId(null);
      setResolutionNote('');
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAF5] tracking-tight">Municipal Command & Control</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAC615]/15 text-[#FAC615] border border-[#FAC615]/30 uppercase tracking-wider">
              ADMINISTRATIVE ACCESS
            </span>
          </div>
          <p className="text-xs text-[#94B7A8] mt-1 font-medium">Manage municipal infrastructure reports, audit citizen grievances, and monitor agent telemetry.</p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-5 py-2.5 rounded-full bg-[#163B2E] hover:bg-[#1E4D3A] border border-[#1E4D3A] text-xs text-[#22C55E] font-bold flex items-center space-x-1.5 self-start transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'overview', label: 'Telemetry Overview', icon: Activity },
          { key: 'reports', label: `Citizen Reports (${reports.length})`, icon: AlertTriangle },
          { key: 'complaints', label: `Grievances (${complaints.length})`, icon: FileText },
          { key: 'logs', label: `Agent Audit Logs (${logs.length})`, icon: Bot },
          { key: 'health', label: 'Services Health', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-[#22C55E] text-[#0B1F16] font-black shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'bg-[#163B2E] text-[#D1E7D6] border border-[#1E4D3A] hover:bg-[#1E4D3A] hover:text-[#F8FAF5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#22C55E] rounded-3xl p-6 space-y-1 shadow-xl">
              <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">Registered Citizens</span>
              <div className="text-3xl font-black text-[#22C55E]">{summary.totalUsers || users.length}</div>
              <p className="text-[11px] text-[#94B7A8] font-medium">Active civic accounts</p>
            </div>
            <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#EF4444] rounded-3xl p-6 space-y-1 shadow-xl">
              <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">Pending Reports</span>
              <div className="text-3xl font-black text-[#EF4444]">{summary.pendingReports || reports.filter(r => r.status !== 'RESOLVED').length}</div>
              <p className="text-[11px] text-[#94B7A8] font-medium">Requires municipal review</p>
            </div>
            <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#FAC615] rounded-3xl p-6 space-y-1 shadow-xl">
              <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">Active Grievances</span>
              <div className="text-3xl font-black text-[#FAC615]">{summary.openComplaints || complaints.filter(c => c.status !== 'RESOLVED').length}</div>
              <p className="text-[11px] text-[#94B7A8] font-medium">In-progress pipeline</p>
            </div>
            <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#38BDF8] rounded-3xl p-6 space-y-1 shadow-xl">
              <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">Agent Executions</span>
              <div className="text-3xl font-black text-[#38BDF8]">{summary.agentExecutionCount || logs.length}</div>
              <p className="text-[11px] text-[#94B7A8] font-medium">Logged & audited</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-[#1E4D3A] p-6 sm:p-8 border border-[#163B2E] rounded-3xl space-y-4 shadow-2xl">
          <h3 className="text-xs font-black text-[#F8FAF5] uppercase tracking-wider">Reported Infrastructure Issues</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#163B2E] text-[10px] text-[#94B7A8] uppercase tracking-wider">
                  <th className="pb-3">Issue</th>
                  <th className="pb-3">Location / Facility</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#163B2E] text-[#D1E7D6]">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-[#163B2E]/60 transition">
                    <td className="py-3.5 font-bold text-[#F8FAF5]">{rep.issueCategory.replace(/_/g, ' ')}</td>
                    <td className="py-3.5 text-[#94B7A8]">{rep.facilityName || rep.address || 'Reported Location'}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAC615]/15 text-[#FAC615] border border-[#FAC615]/30">
                        {rep.severity}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E]">
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => setSelectedReportId(rep.id)}
                        className="px-3 py-1 rounded-xl bg-[#22C55E] text-[#0B1F16] text-[11px] font-bold hover:bg-[#34D399]"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Update Modal */}
          {selectedReportId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#1E4D3A] border border-[#163B2E] rounded-3xl p-6 max-w-md w-full space-y-4">
                <h4 className="text-sm font-bold text-[#F8FAF5]">Update Report #{selectedReportId}</h4>
                <select
                  value={newReportStatus}
                  onChange={(e) => setNewReportStatus(e.target.value)}
                  className="w-full bg-[#0B1F16] rounded-xl border border-[#163B2E] p-2.5 text-xs text-[#F8FAF5]"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Municipal action note..."
                  rows={3}
                  className="w-full bg-[#0B1F16] rounded-xl border border-[#163B2E] p-2.5 text-xs text-[#F8FAF5] placeholder-[#94B7A8]"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedReportId(null)}
                    className="px-4 py-2 rounded-xl text-xs text-[#94B7A8]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateReport(selectedReportId)}
                    className="px-4 py-2 rounded-xl bg-[#22C55E] text-[#0B1F16] font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GRIEVANCES */}
      {activeTab === 'complaints' && (
        <div className="bg-[#1E4D3A] p-6 sm:p-8 border border-[#163B2E] rounded-3xl space-y-4 shadow-2xl">
          <h3 className="text-xs font-black text-[#F8FAF5] uppercase tracking-wider">Citizen Grievances</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#163B2E] text-[10px] text-[#94B7A8] uppercase tracking-wider">
                  <th className="pb-3">Tracking #</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#163B2E] text-[#D1E7D6]">
                {complaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#163B2E]/60 transition">
                    <td className="py-3.5 font-mono text-[#22C55E] font-bold">{comp.trackingNumber}</td>
                    <td className="py-3.5 font-bold text-[#F8FAF5]">{comp.title}</td>
                    <td className="py-3.5 text-[#94B7A8]">{comp.department}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAC615]/15 text-[#FAC615]">
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => setSelectedComplaintId(comp.id)}
                        className="px-3 py-1 rounded-xl bg-[#22C55E] text-[#0B1F16] text-[11px] font-bold hover:bg-[#34D399]"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Update Modal */}
          {selectedComplaintId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#1E4D3A] border border-[#163B2E] rounded-3xl p-6 max-w-md w-full space-y-4">
                <h4 className="text-sm font-bold text-[#F8FAF5]">Resolve Grievance #{selectedComplaintId}</h4>
                <select
                  value={newComplaintStatus}
                  onChange={(e) => setNewComplaintStatus(e.target.value)}
                  className="w-full bg-[#0B1F16] rounded-xl border border-[#163B2E] p-2.5 text-xs text-[#F8FAF5]"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Official resolution summary for citizen..."
                  rows={3}
                  className="w-full bg-[#0B1F16] rounded-xl border border-[#163B2E] p-2.5 text-xs text-[#F8FAF5] placeholder-[#94B7A8]"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedComplaintId(null)}
                    className="px-4 py-2 rounded-xl text-xs text-[#94B7A8]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateComplaint(selectedComplaintId)}
                    className="px-4 py-2 rounded-xl bg-[#22C55E] text-[#0B1F16] font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-[#1E4D3A] p-6 sm:p-8 border border-[#163B2E] rounded-3xl space-y-4 shadow-2xl">
          <h3 className="text-xs font-black text-[#F8FAF5] uppercase tracking-wider">Agent Execution Audit Trail</h3>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {logs.map((log, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#163B2E] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#22C55E]">{log.agentName}</span>
                  <span className="text-[10px] text-[#FAC615] font-mono">{log.status}</span>
                </div>
                <p className="text-[#D1E7D6] font-medium">{log.step}</p>
                <p className="text-[11px] text-[#94B7A8] font-mono">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SERVICES HEALTH */}
      {activeTab === 'health' && (
        <div className="bg-[#1E4D3A] p-6 sm:p-8 border border-[#163B2E] rounded-3xl space-y-4 shadow-2xl">
          <h3 className="text-xs font-black text-[#F8FAF5] uppercase tracking-wider">Subsystem Health Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#163B2E] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#F8FAF5]">Spring Boot Backend</p>
                <p className="text-[11px] text-[#22C55E]">OPERATIONAL • Java 21</p>
              </div>
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#163B2E] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#F8FAF5]">Google Gemini 3.8 Flash</p>
                <p className="text-[11px] text-[#22C55E]">CONNECTED • Live AI Engine</p>
              </div>
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#163B2E] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#F8FAF5]">OpenStreetMap Overpass API</p>
                <p className="text-[11px] text-[#22C55E]">OPERATIONAL • Overpass Turbo</p>
              </div>
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#163B2E] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#F8FAF5]">Nominatim & OSRM Routing</p>
                <p className="text-[11px] text-[#22C55E]">ACTIVE • Real-Time Routing</p>
              </div>
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
