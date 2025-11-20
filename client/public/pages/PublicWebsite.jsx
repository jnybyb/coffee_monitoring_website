import React, { useState, useEffect } from 'react';
import bgImage from '../../assets/images/bg1.png';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import { statisticsAPI } from '../../admin/services/api'; // Corrected import path

const PublicWebsite = () => {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalSeedsDistributed: 0,
    totalAlive: 0,
    totalDead: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching public statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <PublicHeader />
      
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
      />
      
      {/* Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 2,
        }}
      />
      
      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          className="p-8 rounded-2xl shadow-lg max-w-3xl text-center mx-auto"
          style={{
            color: '#fff',
            background: 'none',
          }}
        >
          <h1
            className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            style={{ color: '#228B22' }}
          >
            Welcome to KAPPI
          </h1>
          <p
            className="text-xl md:text-2xl font-light mb-8"
            style={{ color: 'inherit' }}
          >
            A Coffee Farm Monitoring Website for Taocanga, Manay, Davao Oriental.
          </p>
          
          {/* Additional public website content */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>
              Discover the rich coffee heritage of our region and learn about sustainable farming practices 
              that support local communities and preserve our environment.
            </p>
            
            {loading ? (
              <p style={{ marginTop: '2rem' }}>Loading statistics...</p>
            ) : (
              <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, lineHeight: '1' }}>{stats.totalBeneficiaries}</p>
                  <p style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>Total Beneficiaries</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, lineHeight: '1' }}>{stats.totalSeedsDistributed.toLocaleString()}</p>
                  <p style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>Total Seeds Distributed</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, lineHeight: '1' }}>{stats.totalAlive.toLocaleString()}</p>
                  <p style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>Alive Crops</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, lineHeight: '1' }}>{stats.totalDead.toLocaleString()}</p>
                  <p style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>Dead Crops</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicWebsite;
