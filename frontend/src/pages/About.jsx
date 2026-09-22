import React from 'react';
import { HardHat, Server, Database, Layout, ShieldCheck, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">System Architecture & Project Information</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Enterprise full-stack software project specifications and technical overview
        </p>
      </div>

      <div
        className="table-card"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(30, 41, 59, 0.95))',
          borderLeft: '4px solid var(--brand-amber)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-amber), #b45309)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HardHat size={28} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700 }}>
              Mining Equipment & Tyre Maintenance Management Platform
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--brand-amber-light)', fontWeight: 600 }}>
              Project Developer: MARI ESWARAN V
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Designed and engineered as a high-reliability maintenance engineering platform for open-cast and underground mining operations. The platform unifies heavy mobile equipment (Haul Trucks, Hydraulic Excavators, Wheel Loaders) health monitoring, ultra-large OTR radial tyre lifecycle management, preventive maintenance schedules, spare parts inventory control, and role-governed work order execution.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="table-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--brand-amber)' }}>
            <Layout size={20} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600 }}>Frontend Architecture</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li>&bull; React 18 & Vite SPA</li>
            <li>&bull; React Router v6 & Context State</li>
            <li>&bull; Responsive Industrial Styling (Vanilla CSS)</li>
            <li>&bull; Chart.js Interactive Dashboards</li>
            <li>&bull; Lucide Enterprise Icons</li>
          </ul>
        </div>

        <div className="table-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--status-info)' }}>
            <Server size={20} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600 }}>Backend REST API</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li>&bull; Node.js & Express.js Engine</li>
            <li>&bull; JWT Token-Based Authentication</li>
            <li>&bull; Role-Based Authorization (8 Tiers)</li>
            <li>&bull; Helmet & Rate Limiting Security</li>
            <li>&bull; Structured Error Handling</li>
          </ul>
        </div>

        <div className="table-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--status-active)' }}>
            <Database size={20} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600 }}>Database & Storage</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <li>&bull; MongoDB & Mongoose ODM</li>
            <li>&bull; Zero C: Disk Usage (Strictly on E: Drive)</li>
            <li>&bull; Relational Integrity & Compound Indexes</li>
            <li>&bull; Complete Mining Fleet Seed Data</li>
            <li>&bull; Audit Logging on Critical Actions</li>
          </ul>
        </div>
      </div>

      <div className="table-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--brand-amber)" /> Implemented Functional Modules
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Mining Equipment Fleet Directory</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Heavy OTR Tyre Lifecycle Tracking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Tyre Mount, Rotation & Dismount</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Work Orders & Dynamic Checklists</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Spare Parts Inventory & Movements</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Procurement & Purchase Orders</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Equipment Downtime & MTBF/MTTR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Automated Operational Alerts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Multi-Criteria Reports & CSV Export</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--status-active)" />
            <span>Administrative Audit Log Records</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
