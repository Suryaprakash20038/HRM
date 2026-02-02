import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import mediaService from '../../services/mediaService';
import { FiPlus, FiExternalLink, FiBarChart2, FiUser, FiCalendar, FiImage, FiTrash2 } from 'react-icons/fi';
import AddPostModal from './AddPostModal';

const MediaDashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const fetchData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        const [postsData, statsData] = await Promise.all([
          mediaService.getAllPosts(),
          mediaService.getStats()
        ]);
        setPosts(postsData);
        setStats(statsData);
      } else {
        const postsData = await mediaService.getMyPosts();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('❌ Error fetching media data:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePostCreated = () => {
    fetchData();
    setShowModal(false);
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await mediaService.deletePost(id);
        fetchData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleDeleteAllPosts = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete ALL posts? This action cannot be undone!')) {
      try {
        const result = await mediaService.deleteAllPosts();
        alert(`✅ ${result.deletedCount} posts deleted successfully`);
        fetchData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting all posts:', error);
        alert('Failed to delete all posts');
      }
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Facebook': return '#1877F2';
      case 'Instagram': return '#E4405F';
      case 'LinkedIn': return '#0A66C2';
      case 'Twitter': return '#1DA1F2';
      case 'YouTube': return '#FF0000';
      default: return '#6c757d';
    }
  };

  return (
    <div className="container-fluid p-8" style={{ background: '#fdfbff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-10">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
            <h2 className="mb-0 fw-black text-[#2E1A47] tracking-tight" style={{ fontSize: '2.5rem', fontWeight: 900 }}>Media Dashboard</h2>
          </div>
          <p className="text-[#A3779D] fw-bold" style={{ fontSize: '1.1rem' }}>
            {isAdmin ? 'Overview of all employee social media activities' : 'Manage your social media posts'}
          </p>
        </div>
        <div className="d-flex gap-3">
          {!isAdmin && (
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={() => setShowModal(true)}
              style={{
                backgroundColor: '#663399',
                color: 'white',
                borderRadius: '16px',
                padding: '12px 28px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 10px 25px -5px rgba(102, 51, 153, 0.4)',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FiPlus /> Add New Post
            </button>
          )}

          {isAdmin && posts.length > 0 && (
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={handleDeleteAllPosts}
              style={{
                backgroundColor: 'white',
                color: '#DC2626',
                borderRadius: '16px',
                padding: '12px 28px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: '2px solid #fee2e2',
                transition: 'all 0.3s ease'
              }}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <FiTrash2 /> Delete All Posts
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="row g-4 mb-10">
          <div className="col-12">
            <div className="card border-0 shadow-[0_15px_40px_-10px_rgba(102,51,153,0.1)]" style={{ borderRadius: '32px', background: 'white', border: '1px solid #E6C7E6' }}>
              <div className="card-header bg-transparent border-0 pt-8 px-8">
                <h5 className="fw-black mb-0 d-flex align-items-center gap-3 text-[#2E1A47]" style={{ fontWeight: 800 }}>
                  <div className="p-2 rounded-xl bg-[#f3e8ff] text-[#663399]">
                    <FiBarChart2 />
                  </div>
                  Performance Statistics
                </h5>
              </div>
              <div className="card-body p-8">
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Employee Name</th>
                        <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Department</th>
                        <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest text-center px-4 pb-4">Post Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.length > 0 ? (
                        stats.map((stat) => (
                          <tr key={stat._id} className="border-top border-[#f1f5f9]">
                            <td className="py-4 px-4">
                              <div className="d-flex align-items-center gap-3">
                                <div className="bg-[#f3e8ff] rounded-2xl d-flex align-items-center justify-content-center border border-[#E6C7E6]" style={{ width: 44, height: 44 }}>
                                  <FiUser className="text-[#663399]" size={20} />
                                </div>
                                <span className="fw-black text-[#2E1A47]">{stat.firstName} {stat.lastName}</span>
                              </div>
                            </td>
                            <td className="px-4">
                              <span className="px-4 py-1.5 rounded-full bg-[#fdfbff] text-[#A3779D] fw-black border border-[#E6C7E6] text-[11px] text-uppercase tracking-wider">
                                {stat.department}
                              </span>
                            </td>
                            <td className="text-center px-4">
                              <div className="d-inline-flex align-items-center justify-content-center bg-[#f3e8ff] text-[#663399] rounded-xl fw-black px-4 py-2" style={{ minWidth: '40px' }}>
                                {stat.postCount}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-10 text-[#A3779D] fw-bold">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-[0_15px_40px_-10px_rgba(102,51,153,0.1)]" style={{ borderRadius: '32px', background: 'white', border: '1px solid #E6C7E6' }}>
        <div className="card-header bg-transparent border-0 pt-8 px-8">
          <h5 className="fw-black mb-0 d-flex align-items-center gap-3 text-[#2E1A47]" style={{ fontWeight: 800 }}>
            <div className="p-2 rounded-xl bg-[#f3e8ff] text-[#663399]">
              <FiCalendar />
            </div>
            {isAdmin ? 'All Posts Logs' : 'My Posts'}
          </h5>
        </div>
        <div className="card-body p-8">
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner-border text-[#663399]" role="status"></div>
              <p className="mt-4 text-[#A3779D] fw-bold">Loading data...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    {isAdmin && <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Employee</th>}
                    {isAdmin && <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Department</th>}
                    <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Platform</th>
                    <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Summary</th>
                    <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Image</th>
                    <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest px-4 pb-4">Date</th>
                    <th className="border-0 text-[#663399] fw-black small text-uppercase tracking-widest text-end px-4 pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <tr key={post._id} className="border-top border-[#f1f5f9] hover:bg-[#fdfbff] transition-colors">
                        {isAdmin && (
                          <>
                            <td className="fw-black text-[#2E1A47] py-4 px-4">
                              {post.employee ? `${post.employee.firstName} ${post.employee.lastName}` : 'Unknown'}
                            </td>
                            <td className="px-4">
                              <span className="px-3 py-1 rounded-lg bg-[#f9fafb] text-[#A3779D] fw-black border border-[#f1f5f9] text-[10px] text-uppercase tracking-wider">
                                {post.employee?.department || '-'}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-4">
                          <span
                            className="px-4 py-1.5 rounded-xl text-white fw-black text-[10px] text-uppercase tracking-wider"
                            style={{
                              backgroundColor: getPlatformColor(post.platform),
                              boxShadow: `0 8px 15px -4px ${getPlatformColor(post.platform)}44`
                            }}
                          >
                            {post.platform}
                          </span>
                        </td>
                        <td className="text-[#A3779D] fw-semibold px-4" style={{ maxWidth: '300px' }}>
                          <div className="text-truncate" title={post.description}>
                            {post.description || 'No summary available'}
                          </div>
                        </td>
                        <td className="px-4">
                          {post.image ? (
                            <a href={`http://localhost:5000/${post.image.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                              <div className="d-flex align-items-center gap-2 text-[#663399] fw-black small hover:underline">
                                <FiImage size={16} /> <span>View</span>
                              </div>
                            </a>
                          ) : (
                            <span className="text-[#e2e8f0]">-</span>
                          )}
                        </td>
                        <td className="text-[#A3779D] fw-black small px-4">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-end px-4">
                          <div className="d-flex gap-2 justify-content-end">
                            <a
                              href={post.postLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm d-inline-flex align-items-center gap-2"
                              style={{
                                borderRadius: '12px',
                                backgroundColor: '#663399',
                                color: 'white',
                                padding: '8px 16px',
                                fontWeight: 800,
                                border: 'none',
                                textTransform: 'uppercase',
                                fontSize: '10px',
                                letterSpacing: '1px'
                              }}
                            >
                              View Link <FiExternalLink size={12} />
                            </a>
                            {isAdmin && (
                              <button
                                className="btn btn-sm d-inline-flex align-items-center gap-2"
                                onClick={() => handleDeletePost(post._id)}
                                style={{
                                  borderRadius: '12px',
                                  backgroundColor: 'white',
                                  color: '#DC2626',
                                  padding: '8px 16px',
                                  fontWeight: 800,
                                  border: '2px solid #fee2e2',
                                  textTransform: 'uppercase',
                                  fontSize: '10px',
                                  letterSpacing: '1px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <FiTrash2 size={12} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 6} className="text-center py-10 text-[#A3779D] fw-bold">
                        No posts returned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Show modal ONLY for employees */}
      {!isAdmin && showModal && (
        <AddPostModal
          onClose={() => setShowModal(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
};

export default MediaDashboard;
