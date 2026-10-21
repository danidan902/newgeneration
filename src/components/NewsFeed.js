import React, { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';

const NewsFeed = ({ userRole, userId }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userRole) {
      fetchNews();
    }
  }, [userRole]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log('Fetching news for:', userRole);
      const response = await newsAPI.getNews(userRole);
      console.log('News data:', response.data);
      setNews(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (newsId) => {
    try {
      await newsAPI.markAsRead(newsId, userId);
      // Update local state
      setNews(prevNews =>
        prevNews.map(item =>
          item._id === newsId
            ? { ...item, readBy: [...(item.readBy || []), { user: userId }] }
            : item
        )
      );
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button onClick={fetchNews} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">📢 News Feed</h2>
        <p className="text-white/80 text-sm mt-1">Latest announcements for students</p>
      </div>

      <div className="p-6">
        {news.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-4 text-gray-500">No news available</p>
            <p className="text-sm text-gray-400">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => {
              const isRead = item.readBy?.some(read => read.user === userId);
              return (
                <div
                  key={item._id}
                  className={`border rounded-lg p-4 transition-all ${
                    !isRead ? 'border-l-4 border-l-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                        {!isRead && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{item.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>👤 Posted by: {item.sentBy?.name || 'Admin'}</span>
                      </div>
                    </div>
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        className="ml-4 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    {isRead && (
                      <span className="ml-4 text-green-600 text-sm">✓ Read</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;