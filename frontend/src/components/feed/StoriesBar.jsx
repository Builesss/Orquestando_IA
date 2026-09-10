// src/components/feed/StoriesBar.jsx
import React from 'react';
import { MOCK_STORIES } from '../../services/mockData';
import { Plus } from 'lucide-react';
import { usePosts } from '../../context/PostContext';

export const StoriesBar = () => {
  const { setIsStudioOpen, setEditingPost } = usePosts();

  return (
    <div className="w-full glass-card rounded-2xl p-3.5 mb-6 overflow-x-auto scrollbar-none border border-white/5">
      <div className="flex items-center gap-4 min-w-max">
        {MOCK_STORIES.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
            onClick={() => {
              if (story.isUser) {
                setEditingPost(null);
                setIsStudioOpen(true);
              }
            }}
          >
            <div
              className={`relative p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-105 ${
                story.hasNew
                  ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                  : story.isUser
                  ? 'bg-white/20'
                  : 'bg-gray-700/50'
              }`}
            >
              <img
                src={story.avatar}
                alt={story.username}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#0a0b0e]"
              />
              {story.isUser && (
                <div className="absolute bottom-0 right-0 p-1 bg-pink-500 rounded-full text-white shadow-md">
                  <Plus className="w-3 h-3" />
                </div>
              )}
            </div>
            <span className="text-[11px] text-gray-300 font-medium max-w-[68px] truncate text-center">
              {story.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
