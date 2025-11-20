import React, { useState, useEffect } from 'react';
import bgImage from '../components/layout/imgbg1/bg1.png';
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

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        scrollBehavior: 'smooth',
      }}
    >
      {/* Header */}
      <PublicHeader onAboutClick={scrollToAbout} />
      
      {/* Background Image */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
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
          padding: '15rem',
          textAlign: 'center',
          fontFamily: 'Montserrat, Arial, sans-serif',
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
      
      {/* Copyright Section with Black Border - Full Width */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          borderTop: '1px solid #333',
          borderBottom: '1px solid #333',
          padding: '2.7rem',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1rem' }}>
          © 2024 KAPPI - Coffee Farm Monitoring System
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, color: '#fff' }}>
          Taocanga, Manay, Davao Oriental, Philippines
        </p>
      </div>
      
      {/* About Section */}
      <div
        id="about"
        style={{
          position: 'relative',
          zIndex: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '10rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#228B22',
              marginBottom: '2rem',
            }}
          >
            About KAPPI
          </h2>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
                Our Mission
              </h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
                To empower coffee farmers in Taocanga through sustainable farming practices, 
                modern monitoring technology, and community-driven development initiatives.
              </p>
            </div>
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
                Our Vision
              </h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
                A thriving coffee industry that preserves our cultural heritage while 
                embracing innovation for sustainable economic growth and environmental stewardship.
              </p>
            </div>
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
                Our Community
              </h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
                Located in the heart of Davao Oriental, our community of dedicated farmers 
                works together to produce high-quality coffee while protecting our natural resources.
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(34, 139, 34, 0.1)', borderRadius: '10px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#228B22', marginBottom: '1rem' }}>
              Why Choose KAPPI?
            </h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
                <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>Sustainable Farming</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Environmentally conscious practices</p>
              </div>
              <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>Smart Monitoring</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Real-time crop tracking</p>
              </div>
              <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
                <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>Community Support</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Local farmer empowerment</p>
              </div>
              <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☕</div>
                <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>Quality Coffee</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Premium grade production</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicWebsite;
