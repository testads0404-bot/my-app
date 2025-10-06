import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Tool } from './types';
import { translations } from './translations';
import TextGenerator from './components/content/TextGenerator';
import ImageGenerator from './components/content/ImageGenerator';
import VideoGenerator from './components/content/VideoGenerator';
import HashtagGenerator from './components/content/HashtagGenerator';
import PostGenerator from './components/content/PostGenerator';
import IconGenerator from './components/content/IconGenerator';
import BackgroundRemover from './components/content/BackgroundRemover';
import History from './components/content/History';
import { getSchedule, saveSchedule } from './services/scheduleService';
import { generatePost } from './services/geminiService';
import { addHistoryItem } from './services/historyService';
import useNotifications from './hooks/useNotifications';

function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Post);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const t = translations[lang];
  const { sendNotification } = useNotifications(t);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const schedule = getSchedule();
      if (!schedule || schedule.times.length === 0) return;
  
      const now = new Date();
      const today = now.toDateString();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
      schedule.times.forEach(async (time) => {
        if (time === currentTime) {
          const lastRunDate = schedule.lastRun[time] ? new Date(schedule.lastRun[time]).toDateString() : null;
          if (lastRunDate !== today) {
            console.log(`Running scheduled post for ${time} with topic: ${schedule.topic}`);
  
            schedule.lastRun[time] = now.getTime();
            saveSchedule(schedule);
  
            try {
              const postResult = await generatePost(schedule.topic, () => {}, t);
              
              addHistoryItem({
                tool: Tool.Post,
                prompt: { prompt: schedule.topic, scheduled: true, time },
                result: postResult,
              });
  
              sendNotification(t.notifications.postReadyTitle, {
                body: t.notifications.postReadyBody.replace('{topic}', schedule.topic),
                icon: '/favicon.ico' 
              });
            } catch (error) {
              console.error(`Failed to generate scheduled post for topic: ${schedule.topic}`, error);
            }
          }
        }
      });
    }, 60000); // Check every minute
  
    return () => clearInterval(interval);
  }, [lang, t, sendNotification]);

  const renderActiveTool = () => {
    switch (activeTool) {
      case Tool.Post:
        return <PostGenerator t={t} />;
      case Tool.Text:
        return <TextGenerator t={t} />;
      case Tool.Image:
        return <ImageGenerator t={t} />;
      case Tool.Video:
        return <VideoGenerator t={t} />;
      case Tool.Hashtag:
        return <HashtagGenerator t={t} />;
      case Tool.Icon:
        return <IconGenerator t={t} />;
      case Tool.BackgroundRemover:
        return <BackgroundRemover t={t} />;
      case Tool.History:
        return <History t={t} />;
      default:
        return <PostGenerator t={t} />;
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans transition-colors duration-300">
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        t={t.sidebar}
        isOpen={isSidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 mb-4 bg-white dark:bg-slate-800 rounded-md shadow">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {renderActiveTool()}
      </main>
    </div>
  );
}

export default App;