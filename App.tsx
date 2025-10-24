import React, { useState, FC, ReactNode, useEffect, useCallback, FormEvent, useRef } from 'react';
import { AppView, LegalDocumentType, legalDocumentTypeMap, viewToDocumentTypeMap } from './types';
import { generateLegalDocument, getChatResponse } from './services/geminiService';
import { BookOpen, Calculator, FileText, Gavel, Home, Scale, Shield, Landmark, Menu, X, MessageSquare, FilePenLine, HelpCircle, Briefcase, SendHorizontal, Copy, Check } from 'lucide-react';

// --- Types ---
type MenuItem = { id: AppView; label: string; icon: ReactNode; type?: 'item' } | { type: 'divider'; label: string; };

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}


// --- Constants ---
const menuItems: MenuItem[] = [
  { id: AppView.Home, label: 'صفحه اصلی', icon: <Home size={20} /> },
  { id: AppView.GeneralChat, label: 'چت عمومی حقوقی', icon: <MessageSquare size={20} /> },
  { type: 'divider', label: 'تنظیم اوراق قضایی' },
  { id: AppView.DadkhastHoghooghi, label: 'دادخواست حقوقی', icon: <FileText size={20} /> },
  { id: AppView.ShekayatKeyfari, label: 'شکواییه کیفری', icon: <FileText size={20} /> },
  { id: AppView.DadkhastEdareKar, label: 'دادخواست اداره کار', icon: <FileText size={20} /> },
  { id: AppView.DadkhastSabti, label: 'دادخواست ثبتی', icon: <FileText size={20} /> },
  { id: AppView.ShokvaieTazirat, label: 'شکواییه تعزیرات', icon: <FileText size={20} /> },
  { id: AppView.LayeheHoghooghi, label: 'لایحه حقوقی', icon: <FilePenLine size={20} /> },
  { id: AppView.LayeheKeyfari, label: 'لایحه کیفری', icon: <FilePenLine size={20} /> },
  { id: AppView.LayeheEdareKar, label: 'لایحه اداره کار', icon: <FilePenLine size={20} /> },
  { id: AppView.LayeheSabti, label: 'لایحه ثبتی', icon: <FilePenLine size={20} /> },
  { id: AppView.LayeheKhanevadeh, label: 'لایحه خانواده', icon: <FilePenLine size={20} /> },
  { type: 'divider', label: 'ابزارها و تحلیل' },
  { id: AppView.CostCalculator, label: 'محاسبه هزینه دادرسی', icon: <Calculator size={20} /> },
  { id: AppView.LegalAnalysis, label: 'آنالیز و سوالات حقوقی', icon: <HelpCircle size={20} /> },
  { id: AppView.EjrayeAhkamHoghooghi, label: 'رویه اجرای احکام حقوقی', icon: <Gavel size={20} /> },
  { id: AppView.EjrayeAhkamKeyfari, label: 'رویه اجرای احکام کیفری', icon: <Gavel size={20} /> },
];


// --- UI Components ---

const Spinner: FC = () => (
  <div className="flex justify-center items-center h-full">
    <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

const Sidebar: FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
    const handleItemClick = (view: AppView) => {
        setCurrentView(view);
        if (window.innerWidth < 768) { // md breakpoint
            setIsOpen(false);
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
            <aside className={`fixed inset-y-0 right-0 w-72 bg-gray-800 p-4 flex-col z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:flex md:h-screen md:sticky md:top-0`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Scale className="text-cyan-400" size={32} />
                        <h1 className="text-xl font-bold mr-3 text-white">دستیار حقوقی</h1>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white" aria-label="بستن منو">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex flex-col space-y-1 overflow-y-auto pr-1 scrollbar-thin">
                    {menuItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return <h2 key={`divider-${index}`} className="text-xs font-bold text-gray-500 uppercase pt-4 pb-1 px-3">{item.label}</h2>;
                        }
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-right ${
                                    currentView === item.id
                                    ? 'bg-cyan-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                {item.icon}
                                <span className="mr-3">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

const Header: FC<{ toggleSidebar: () => void; title: string }> = ({ toggleSidebar, title }) => (
    <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-700 md:hidden">
        <div className="flex items-center">
            <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <button onClick={toggleSidebar} className="text-gray-300 hover:text-white" aria-label="باز کردن منو">
            <Menu size={28} />
        </button>
    </header>
);

const HomeComponent: FC<{setCurrentView: (view: AppView) => void}> = ({setCurrentView}) => (
    <div className="p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4">به دستیار حقوقی هوشمند Gemini خوش آمدید</h2>
        <p className="text-base md:text-lg text-gray-400 max-w-3xl">
            این ابزار قدرتمند برای کمک به حقوقدانان، وکلا، دانشجویان و عموم مردم طراحی شده است. از منوی برنامه برای دسترسی به بخش‌های مختلف مانند تنظیم اوراق قضایی، محاسبه هزینه‌ها، تحلیل‌های حقوقی و راهنمایی‌های اجرایی استفاده کنید.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {menuItems.filter(item => item.type !== 'divider' && item.id !== AppView.Home).map(item => 'id' in item && (
                <button key={item.id} onClick={() => setCurrentView(item.id)} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all duration-300 text-right">
                    <div className="flex items-center text-cyan-400 mb-3">
                        {item.icon}
                        <h3 className="text-xl font-semibold mr-3 text-white">{item.label}</h3>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

const DocumentGenerator: FC<{ documentType: LegalDocumentType }> = ({ documentType }) => {
    const [plaintiffInfo, setPlaintiffInfo] = useState('');
    const [defendantInfo, setDefendantInfo] = useState('');
    const [subject, setSubject] = useState('');
    const [facts, setFacts] = useState('');
    const [evidence, setEvidence] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    
    const documentTitle = legalDocumentTypeMap[documentType];

    useEffect(() => {
      // Reset form when document type changes
      setPlaintiffInfo('');
      setDefendantInfo('');
      setSubject('');
      setFacts('');
      setEvidence('');
      setGeneratedText('');
      setError('');
    }, [documentType]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setGeneratedText('');
        try {
            const result = await generateLegalDocument({
                documentType, plaintiffInfo, defendantInfo, subject, facts, evidence
            });
            setGeneratedText(result);
        } catch (err: any) {
            setError(err.message || "خطایی رخ داده است.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        if (isCopied || !generatedText) return;
        navigator.clipboard.writeText(generatedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-6">تنظیم {documentTitle}</h2>
            <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
                    <input type="text" placeholder="مشخصات خواهان/شاکی" value={plaintiffInfo} onChange={e => setPlaintiffInfo(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5" />
                    <input type="text" placeholder="مشخصات خوانده/مشتکی‌عنه" value={defendantInfo} onChange={e => setDefendantInfo(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5" />
                    <input type="text" placeholder="موضوع خواسته/اتهام" value={subject} onChange={e => setSubject(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5" />
                    <textarea placeholder="شرح ماجرا..." value={facts} onChange={e => setFacts(e.target.value)} rows={6} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"></textarea>
                    <textarea placeholder="دلایل و منضمات..." value={evidence} onChange={e => setEvidence(e.target.value)} rows={3} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5"></textarea>
                    <button type="submit" disabled={isLoading} className="w-full text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? 'در حال تولید...' : `تولید ${documentTitle}`}
                    </button>
                </form>
                 <div className="w-full md:w-1/2 bg-gray-800 rounded-lg p-4 flex flex-col overflow-hidden relative">
                    <div className="flex-grow overflow-y-auto scrollbar-thin pr-2">
                        {isLoading && <Spinner />}
                        {error && <div className="text-red-400 p-4">{error}</div>}
                        {generatedText && (
                           <pre className="whitespace-pre-wrap text-sm leading-relaxed">{generatedText}</pre>
                        )}
                        {!isLoading && !error && !generatedText && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                سند تولید شده در اینجا نمایش داده می‌شود.
                            </div>
                        )}
                    </div>
                    {generatedText && !isLoading && (
                        <div className="pt-2 mt-2 border-t border-gray-700">
                            <button onClick={copyToClipboard} className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded transition-colors disabled:cursor-not-allowed">
                                {isCopied ? <Check size={18} className="text-green-400 ml-2" /> : <Copy size={18} className="ml-2" />}
                                {isCopied ? 'کپی شد!' : 'کپی متن سند'}
                           </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatView: FC<{ title: string; topic: string }> = ({ title, topic }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const historyForApi = newMessages.filter(m => m.role !== 'user' || m.text.trim() !== '').map(m => ({ role: m.role, text: m.text }));
      const response = await getChatResponse(historyForApi.slice(0, -1), userInput, topic);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'متاسفانه خطایی رخ داد.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-4">{title}</h2>
      <div className="flex-grow bg-gray-800 rounded-lg p-4 flex flex-col overflow-y-auto scrollbar-thin space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-700 text-gray-200">
               <Spinner />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="سوال خود را بپرسید..."
          className="flex-grow bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 disabled:bg-gray-500">
          <SendHorizontal size={20} />
        </button>
      </form>
    </div>
  );
};


const CostCalculator: FC = () => {
    const [claimValue, setClaimValue] = useState<number | ''>('');
    const [courtFee, setCourtFee] = useState<string>('۰');
    const [attorneyFee, setAttorneyFee] = useState<string>('۰');

    const calculateFees = useCallback((value: number) => {
        if (isNaN(value) || value <= 0) {
            setCourtFee('۰');
            setAttorneyFee('۰');
            return;
        }

        let fee = 0;
        // تعرفه خدمات قضایی سال ۱۴۰۳
        if (value <= 200000000) {
            fee = value * 0.025;
        } else {
            fee = (200000000 * 0.025) + ((value - 200000000) * 0.035);
        }
        setCourtFee(fee.toLocaleString());

        let attFee = 0;
        // تعرفه حق الوکاله
        if (value <= 500000000) attFee = value * 0.08;
        else if (value <= 2000000000) attFee = (500000000 * 0.08) + ((value - 500000000) * 0.07);
        else if (value <= 10000000000) attFee = (500000000 * 0.08) + (1500000000 * 0.07) + ((value - 2000000000) * 0.05);
        else attFee = (500000000 * 0.08) + (1500000000 * 0.07) + (8000000000 * 0.05) + ((value - 10000000000) * 0.04);
        
        const minFee = 5000000;
        const maxFee = 20000000000;
        if(attFee < minFee) attFee = minFee;
        if(attFee > maxFee) attFee = maxFee;

        setAttorneyFee(attFee.toLocaleString());

    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setClaimValue(val === '' ? '' : Number(val));
        calculateFees(Number(val));
    };


    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-6">محاسبه هزینه دادرسی و حق‌الوکاله</h2>
            <div className="max-w-lg">
                <label className="block mb-2 text-sm font-medium text-gray-300">مبلغ خواسته (ریال)</label>
                <input 
                    type="number"
                    value={claimValue}
                    onChange={handleInputChange}
                    placeholder="مبلغ خواسته را به ریال وارد کنید"
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
            </div>
            <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 max-w-lg">
                <h3 className="text-xl font-semibold mb-4">نتایج محاسبه:</h3>
                <div className="space-y-3 text-lg">
                    <p><strong>هزینه دادرسی (مرحله بدوی):</strong> <span className="text-cyan-400 font-bold">{courtFee}</span> ریال</p>
                    <p><strong>حق‌الوکاله وکیل (طبق تعرفه):</strong> <span className="text-cyan-400 font-bold">{attorneyFee}</span> ریال</p>
                    <p className="text-xs text-gray-500 pt-4">توجه: محاسبات بر اساس تعرفه‌های سال ۱۴۰۳ می‌باشد. هزینه دادرسی در مراحل تجدیدنظر و واخواهی متفاوت است. حداقل حق‌الوکاله ۵ میلیون ریال و حداکثر آن ۲۰ میلیارد ریال است.</p>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---

const App: FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    const docType = viewToDocumentTypeMap[currentView];
    if(docType) {
        return <DocumentGenerator documentType={docType} />;
    }

    const currentMenuItem = menuItems.find(item => 'id' in item && item.id === currentView);
    const title = currentMenuItem?.label || 'دستیار حقوقی';

    switch (currentView) {
      case AppView.Home:
        return <HomeComponent setCurrentView={setCurrentView} />;
      case AppView.GeneralChat:
        return <ChatView title="چت عمومی حقوقی" topic="عمومی حقوقی و کیفری" />;
      case AppView.CostCalculator:
        return <CostCalculator />;
      case AppView.EjrayeAhkamHoghooghi:
        return <ChatView title="رویه اجرای احکام حقوقی" topic="قوانین و رویه اجرای احکام حقوقی" />;
      case AppView.EjrayeAhkamKeyfari:
        return <ChatView title="رویه اجرای احکام کیفری" topic="قوانین و رویه اجرای احکام کیفری" />;
      case AppView.LegalAnalysis:
        return <ChatView title="آنالیز حقوقی و سوالات تخصصی" topic="تحلیل دقیق سوالات مطابق قانون، رویه حاکم و نظریات دکترین" />;
      default:
        return <HomeComponent setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(true)}
          title={menuItems.find(item => 'id' in item && item.id === currentView)?.label || 'صفحه اصلی'}
        />
        <div className="flex-1 overflow-y-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
