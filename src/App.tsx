import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Home } from './pages/Home';
import { AnswerKeyPage } from './pages/AnswerKeyPage';
import { ScanPage } from './pages/ScanPage';
import { ResultsPage } from './pages/ResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrintableAnswerSheetModal } from './components/PrintableAnswerSheetModal';
import { MasterAnswerKey, StudentResult, AppSettings } from './types';
import { DEMO_ANSWER_KEY_10, DEMO_ANSWER_KEY_20, createDemoStudents } from './data/demoData';

const SETTINGS_STORAGE_KEY = 'ctn_settings';
const KEYS_STORAGE_KEY = 'ctn_saved_keys';
const RESULTS_STORAGE_KEY = 'ctn_results';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // 1. Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      geminiApiKey: '',
      recognitionMode: 'ai',
      uncertainThreshold: 0.80,
      soundEnabled: true,
      vibrationEnabled: true,
    };
  });

  // 2. Saved Answer Keys State
  const [savedKeys, setSavedKeys] = useState<MasterAnswerKey[]>(() => {
    try {
      const stored = localStorage.getItem(KEYS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [DEMO_ANSWER_KEY_10, DEMO_ANSWER_KEY_20];
  });

  // 3. Active Answer Key State
  const [activeKey, setActiveKey] = useState<MasterAnswerKey | null>(() => {
    return savedKeys.length > 0 ? savedKeys[0] : DEMO_ANSWER_KEY_10;
  });

  // 4. Student Graded Results State
  const [results, setResults] = useState<StudentResult[]>(() => {
    try {
      const stored = localStorage.getItem(RESULTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return createDemoStudents();
  });

  // Save Settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Save Answer Keys to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(savedKeys));
    } catch (e) {
      console.error(e);
    }
  }, [savedKeys]);

  // Save Results to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
      console.error(e);
    }
  }, [results]);

  // Handlers
  const handleSaveKey = (keyToSave: MasterAnswerKey) => {
    setSavedKeys((prev) => {
      const existsIdx = prev.findIndex((k) => k.id === keyToSave.id);
      if (existsIdx >= 0) {
        const copy = [...prev];
        copy[existsIdx] = keyToSave;
        return copy;
      }
      return [keyToSave, ...prev];
    });
    setActiveKey(keyToSave);
  };

  const handleSelectKey = (key: MasterAnswerKey) => {
    setActiveKey(key);
  };

  const handleSaveResult = (newResult: StudentResult) => {
    setResults((prev) => {
      const exists = prev.findIndex((r) => r.id === newResult.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = newResult;
        return copy;
      }
      return [newResult, ...prev];
    });
  };

  const handleDeleteResult = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllResults = () => {
    setResults([]);
    try {
      localStorage.removeItem(RESULTS_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunDemo = () => {
    const demoStudents = createDemoStudents();
    setSavedKeys((prev) => {
      if (!prev.some((k) => k.id === DEMO_ANSWER_KEY_10.id)) {
        return [DEMO_ANSWER_KEY_10, ...prev];
      }
      return prev;
    });
    setActiveKey(DEMO_ANSWER_KEY_10);
    setResults(demoStudents);
    setActiveTab('results');
  };

  const handleClearAllData = () => {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(KEYS_STORAGE_KEY);
    localStorage.removeItem(RESULTS_STORAGE_KEY);
    setSavedKeys([DEMO_ANSWER_KEY_10]);
    setActiveKey(DEMO_ANSWER_KEY_10);
    setResults([]);
    setSettings({
      geminiApiKey: '',
      recognitionMode: 'ai',
      uncertainThreshold: 0.80,
      soundEnabled: true,
      vibrationEnabled: true,
    });
    setActiveTab('home');
    alert('Đã xóa sạch toàn bộ dữ liệu cục bộ!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Header & Bottom Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeKeyTitle={activeKey?.title}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
      />

      {/* Main Page Container */}
      <main className="px-3 sm:px-6 pt-4 pb-12 max-w-5xl mx-auto">
        {activeTab === 'home' && (
          <Home
            setActiveTab={setActiveTab}
            activeAnswerKey={activeKey}
            resultsCount={results.length}
            onRunDemo={handleRunDemo}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'key' && (
          <AnswerKeyPage
            activeKey={activeKey}
            savedKeys={savedKeys}
            onSaveKey={handleSaveKey}
            onSelectKey={handleSelectKey}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'scan' && (
          <ScanPage
            activeKey={activeKey}
            geminiApiKey={settings.geminiApiKey}
            onSaveResult={handleSaveResult}
            onGoToAnswerKey={() => setActiveTab('key')}
            onGoToSettings={() => setActiveTab('settings')}
            batchResults={results}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'results' && (
          <ResultsPage
            results={results}
            onDeleteResult={handleDeleteResult}
            onClearAll={handleClearAllResults}
            activeAnswerKeyTitle={activeKey?.title}
            activeKey={activeKey}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onSaveSettings={setSettings}
            onRunDemo={handleRunDemo}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Printable Answer Sheet Generator Modal */}
      <PrintableAnswerSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        activeAnswerKey={activeKey}
      />
    </div>
  );
}

