import React, { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';

const NewsList = ({ userRole = 'student', userId = 'user123' }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('byRole'); // 'byRole' or 'all'

  useEffect(() => {
    fetchNews();
  }, [userRole, viewMode]);

  const fetchNews = async () => {
    try {
      let response;
      if (viewMode === 'all') {
        response = await newsAPI.getAllNews();
      } else {
        response = await newsAPI.getNews(userRole);
      }
      setNews(response.data.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (newsId) => {
    try {
      await newsAPI.markAsRead(newsId, userId);
      fetchNews();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        await newsAPI.deleteNews(newsId);
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading news...</div>;

  return (
    <div className="news-list">
      <div className="view-controls">
        <h2>{viewMode === 'all' ? 'All News' : `News for ${userRole}s`}</h2>
        <div className="toggle-buttons">
          <button 
            className={viewMode === 'byRole' ? 'active' : ''}
            onClick={() => setViewMode('byRole')}
          >
            My News
          </button>
          <button 
            className={viewMode === 'all' ? 'active' : ''}
            onClick={() => setViewMode('all')}
          >
            All News
          </button>
        </div>
      </div>
      
      {news.length === 0 ? (
        <p className="no-news">No news available</p>
      ) : (
        <div className="news-grid">
          {news.map(item => {
            const isRead = item.readBy?.some(read => 
              read.user === userId
            );
            
            return (
              <div key={item._id} className={`news-card ${!isRead ? 'unread' : ''}`}>
                <div className="news-header">
                  <h3>{item.title}</h3>
                  <button 
                    onClick={() => handleDeleteNews(item._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
                
                <p className="news-content">{item.content}</p>
                
                <div className="news-meta">
                  <small>
                    Sent by: {item.sentBy?.name || 'System'} ({item.sentBy?.role || 'admin'})
                  </small>
                  <small>
                    Date: {new Date(item.createdAt).toLocaleDateString()}
                  </small>
                  <small>
                    Target: {item.targetRoles.join(', ')}
                  </small>
                  <small>
                    Read by: {item.readBy?.length || 0} users
                  </small>
                </div>
                
                {!isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(item._id)}
                    className="read-btn"
                  >
                    Mark as Read
                  </button>
                )}
                
                {isRead && (
                  <span className="read-badge">✓ Read</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsList;