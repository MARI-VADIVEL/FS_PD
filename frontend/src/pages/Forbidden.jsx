import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}
      >
        <ShieldAlert size={44} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.5rem' }}>
        403 - Access Forbidden
      </h1>
      <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '2rem', fontSize: '1rem' }}>
        Your user role does not have permission to access this module or administrative page. Contact your System Administrator if you require elevated privileges.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Home size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
