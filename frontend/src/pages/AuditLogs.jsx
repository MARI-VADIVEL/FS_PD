import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { ScrollText, Filter, Search } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { addToast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (moduleFilter) params.append('module', moduleFilter);
      if (userSearch) params.append('user', userSearch);

      const res = await api.get(`/audit?${params.toString()}`);
      if (res.data.success) {
        setLogs(res.data.logs);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      addToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (row) => new Date(row.createdAt).toLocaleString()
    },
    {
      key: 'module',
      label: 'Module',
      render: (row) => (
        <span
          className="badge"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--brand-amber-light)' }}
        >
          {row.module}
        </span>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{row.action}</span>
    },
    { key: 'description', label: 'Audit Description' },
    {
      key: 'user',
      label: 'User & Role',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.userName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)' }}>{row.userRole}</div>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Administrative Audit Trail & Compliance Log</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Immutable record of system state changes, work order updates, inventory movements, and logins
        </p>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <form onSubmit={handleSearch} className="toolbar-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by User name..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </form>

          <div className="toolbar-filters">
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="select-filter"
            >
              <option value="">All Modules</option>
              <option value="Equipment">Equipment</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Tyres">Tyres</option>
              <option value="Inventory">Inventory</option>
              <option value="Auth">Auth</option>
              <option value="Users">Users</option>
              <option value="Settings">Settings</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyTitle="No audit records"
          emptyDescription="Audit logs will appear as administrative actions are executed."
          page={page}
          pages={pages}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
};

export default AuditLogs;
