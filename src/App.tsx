import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { analyzeResume, isResumeApiConfigured } from "./api";
import type { AnalysisRecord, Job, PageId } from "./types";

type IconName =
  | "grid" | "upload" | "clock" | "briefcase" | "book" | "user" | "settings" | "bell"
  | "search" | "arrow" | "sparkles" | "file" | "check" | "chevron" | "external"
  | "bookmark" | "trend" | "target" | "close" | "menu" | "shield" | "download"
  | "more" | "plus" | "calendar" | "mail" | "globe" | "lock" | "arrow-up"
  | "upload-cloud" | "check-circle" | "refresh";

const iconPaths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" /><path d="M4 5v14a3 3 0 0 1 3-3h13M9 7h7" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.1 1.8-1.6 2.8-2.1-.4a8 8 0 0 1-1.7 1l-.8 2h-3.2l-.8-2a8 8 0 0 1-1.7-1l-2.1.4-1.6-2.8L6 15a8 8 0 0 1 0-2l-1.1-1.9 1.6-2.8 2.1.4a8 8 0 0 1 1.7-1l.8-2h3.2l.8 2a8 8 0 0 1 1.7 1l2.1-.4 1.6 2.8L19.4 13a8 8 0 0 1 0 2Z" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2zM19 15l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" /></>,
  file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" /><path d="M13 3v7h7M8 15h8M8 18h6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />,
  trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v3h14v-3" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  "arrow-up": <><path d="M12 19V5m-6 6 6-6 6 6" /></>,
  "upload-cloud": <><path d="M16 16l-4-4-4 4M12 12v9" /><path d="M20 16.5A4.5 4.5 0 0 0 18 8h-1.3A7 7 0 1 0 4 14.2" /></>,
  "check-circle": <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.5-3" /></>,
};

function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}

const navigation: { id: PageId; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "upload", label: "Upload resume", icon: "upload" },
  { id: "history", label: "Analysis history", icon: "clock" },
  { id: "jobs", label: "Job recommendations", icon: "briefcase" },
  { id: "resources", label: "Learning resources", icon: "book" },
];

const sampleAnalyses: AnalysisRecord[] = [
  { id: "an-1", name: "Product Designer Resume.pdf", role: "Product Designer", date: "Today, 9:41 AM", score: 86, status: "Reviewed", isSample: true },
  { id: "an-2", name: "UX Research CV.pdf", role: "UX Researcher", date: "Oct 18, 2025", score: 74, status: "Reviewed", isSample: true },
  { id: "an-3", name: "Portfolio Resume.pdf", role: "Visual Designer", date: "Oct 12, 2025", score: 68, status: "In progress", isSample: true },
];

const sampleJobs: Job[] = [
  { id: "job-1", company: "Linear", initials: "L", role: "Product Designer", location: "Remote · US", type: "Full-time", match: 96, tone: "lavender" },
  { id: "job-2", company: "Figma", initials: "F", role: "UX Designer", location: "New York, NY", type: "Full-time", match: 91, tone: "peach" },
  { id: "job-3", company: "Notion", initials: "N", role: "Product Design Intern", location: "Remote · US", type: "Internship", match: 88, tone: "mint" },
  { id: "job-4", company: "Webflow", initials: "W", role: "Associate Product Designer", location: "San Francisco, CA", type: "Full-time", match: 84, tone: "blue" },
];

const resources = [
  { category: "RESUME WRITING", title: "Write bullet points recruiters actually notice", description: "A practical guide to turning your day-to-day work into clear, measurable impact.", duration: "8 min read", tone: "peach", icon: "file" as const },
  { category: "INTERVIEW PREP", title: "The product design interview playbook", description: "Build confidence with a repeatable framework for every interview stage.", duration: "12 min read", tone: "lavender", icon: "target" as const },
  { category: "SKILL BUILDING", title: "Make your portfolio tell a better story", description: "Show how you think, not just what you made, with stronger case studies.", duration: "Course · 35 min", tone: "mint", icon: "sparkles" as const },
];

function App() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ score: number; isSample: boolean; summary?: string } | null>(null);
  const [analyses, setAnalyses] = useState(sampleAnalyses);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentPageLabel = navigation.find((item) => item.id === activePage)?.label
    ?? (activePage === "profile" ? "My profile" : "Settings");

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sampleJobs.filter((job) =>
      !query || `${job.company} ${job.role} ${job.location}`.toLowerCase().includes(query),
    );
  }, [search]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3800);
  };
  const navigate = (page: PageId) => {
    setActivePage(page);
    setSidebarOpen(false);
  };
  const chooseFile = (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(extension ?? "")) {
      notify("Please choose a PDF, DOC, or DOCX resume.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notify("Your resume must be smaller than 10 MB.");
      return;
    }
    setSelectedFile(file);
    setAnalysis(null);
  };
  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0]);
    event.target.value = "";
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  };
  const runAnalysis = async () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }
    if (!isResumeApiConfigured) {
      notify("Demo mode: your resume stays on this device and was not uploaded. Configure a compatible analyzer to get real results.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(selectedFile);
      setAnalysis({ score: result.atsScore, isSample: false, summary: result.summary });
      setAnalyses((current) => [
        {
          id: `an-${Date.now()}`,
          name: selectedFile.name,
          role: result.title || "Resume analysis",
          date: "Just now",
          score: result.atsScore,
          status: "Reviewed",
          isSample: false,
        },
        ...current,
      ]);
      notify("Your resume analysis is ready.");
      setActivePage("dashboard");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Resume analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const toggleSavedJob = (jobId: string) => {
    setSavedJobs((current) => current.includes(jobId)
      ? current.filter((savedId) => savedId !== jobId)
      : [...current, jobId]);
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
        <div className="brand-lockup"><div className="brand-mark"><Icon name="sparkles" size={20} /></div><span>orbit<span className="brand-dot">.</span></span><button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><Icon name="close" /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map((item) => <button key={item.id} className={`nav-item${activePage === item.id ? " nav-item-active" : ""}`} onClick={() => navigate(item.id)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{item.id === "jobs" && <span className="nav-count">4</span>}</button>)}
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">ACCOUNT</div>
        <nav className="primary-nav" aria-label="Account navigation">
          <button className={`nav-item${activePage === "profile" ? " nav-item-active" : ""}`} onClick={() => navigate("profile")}><Icon name="user" size={19} /><span>My profile</span></button>
          <button className={`nav-item${activePage === "settings" ? " nav-item-active" : ""}`} onClick={() => navigate("settings")}><Icon name="settings" size={19} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip"><div className="tip-icon"><Icon name="sparkles" size={18} /></div><p className="tip-title">Your next role is closer.</p><p className="tip-copy">Small improvements to your resume can make a big difference.</p><button className="tip-link" onClick={() => navigate("resources")}>Explore resources <Icon name="arrow" size={15} /></button></div>
        <button className="sidebar-profile" onClick={() => navigate("profile")}><div className="avatar avatar-sidebar">AM</div><span className="sidebar-profile-copy"><strong>Alex Morgan</strong><small>Student plan</small></span><Icon name="more" size={19} /></button>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-leading"><button className="icon-button menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Icon name="menu" /></button><div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={15} /><strong>{currentPageLabel}</strong></div></div>
          <div className="topbar-actions">
            <label className="search-field"><Icon name="search" size={18} /><input aria-label="Search jobs" placeholder="Search opportunities..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
            <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Icon name="bell" size={20} /><span className="notification-dot" /></button>{notificationsOpen && <div className="notification-popover"><strong>You’re all caught up</strong><span>We’ll let you know when new opportunities match your profile.</span></div>}</div>
            <button className="avatar avatar-top" aria-label="Open profile" onClick={() => navigate("profile")}>AM</button>
          </div>
        </header>
        <div className="page-content">
          {activePage === "dashboard" && <Dashboard onNavigate={navigate} onUpload={() => navigate("upload")} analysis={analysis} analyses={analyses} savedJobs={savedJobs} onSaveJob={toggleSavedJob} />}
          {activePage === "upload" && <UploadPage file={selectedFile} inputRef={fileInputRef} dragging={isDragging} isAnalyzing={isAnalyzing} apiConfigured={isResumeApiConfigured} onInput={handleFileInput} onDrop={handleDrop} onDragOver={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} onChoose={() => fileInputRef.current?.click()} onAnalyze={runAnalysis} onClear={() => { setSelectedFile(null); setAnalysis(null); }} analysis={analysis} onNavigate={navigate} />}
          {activePage === "history" && <HistoryPage analyses={analyses} onUpload={() => navigate("upload")} />}
          {activePage === "jobs" && <JobsPage jobs={filteredJobs} savedJobs={savedJobs} onSave={toggleSavedJob} search={search} />}
          {activePage === "resources" && <ResourcesPage />}
          {activePage === "profile" && <ProfilePage onSave={() => { setProfileSaved(true); notify("Profile changes saved."); }} saved={profileSaved} />}
          {activePage === "settings" && <SettingsPage emailUpdates={emailUpdates} onToggleEmail={() => setEmailUpdates((enabled) => !enabled)} onSave={() => notify("Your preferences are up to date.")} />}
        </div>
        <footer className="page-footer"><span>Made for your next chapter.</span><span><Icon name="shield" size={14} /> Your data stays yours</span></footer>
      </main>
      {toast && <div className="toast-message" role="status"><Icon name="check-circle" size={19} />{toast}</div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function SampleTag({ children = "SAMPLE DATA" }: { children?: ReactNode }) {
  return <span className="sample-tag"><span />{children}</span>;
}

function Dashboard({ onNavigate, onUpload, analysis, analyses, savedJobs, onSaveJob }: {
  onNavigate: (page: PageId) => void;
  onUpload: () => void;
  analysis: { score: number; isSample: boolean; summary?: string } | null;
  analyses: AnalysisRecord[];
  savedJobs: string[];
  onSaveJob: (id: string) => void;
}) {
  const score = analysis?.score ?? 86;
  const hasRealAnalysis = Boolean(analysis && !analysis.isSample);
  return <>
    <div className="dashboard-heading"><div><div className="eyebrow">WEDNESDAY, OCTOBER 29, 2025</div><h1>Good morning, Alex <span className="wave">✦</span></h1><p>Here’s what’s happening with your career journey.</p></div><button className="button button-primary" onClick={onUpload}><Icon name="plus" size={18} /> Analyze a resume</button></div>
    <section className="hero-banner"><div className="hero-copy"><span className="hero-kicker"><Icon name="sparkles" size={15} /> YOUR CAREER, IN FOCUS</span><h2>A little clarity goes<br className="desktop-break" /> a long way.</h2><p>Get a clearer picture of your strengths and find work that feels like a fit.</p><button className="button button-light" onClick={onUpload}>Start with your resume <Icon name="arrow" size={17} /></button></div><div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-star star-one">✦</div><div className="hero-star star-two">✦</div><div className="hero-document"><div className="document-mark"><Icon name="sparkles" size={17} /></div><div className="document-lines"><i /><i /><i /></div><div className="document-score"><span>FIT SCORE</span><strong>{score}%</strong><span className="score-pill"><Icon name="arrow-up" size={12} /> rising</span></div><div className="document-bars"><i /><i /><i /><i /><i /><i /><i /></div></div><div className="floating-badge"><span><Icon name="check" size={15} /></span> Looking good!</div></div><div className="hero-decoration" aria-hidden="true" /></section>
    <div className="overview-row">
      <section className="card ats-card"><div className="card-heading"><div><span className="section-label">RESUME HEALTH</span><h2>Your ATS score</h2></div><button className="icon-button subtle-button" aria-label="More resume health options"><Icon name="more" /></button></div><div className="ats-body"><div className="score-ring" style={{ "--score": `${score}%` } as React.CSSProperties}><div><strong>{score}</strong><span>/100</span></div></div><div className="ats-summary"><span className={`score-status${hasRealAnalysis ? " real-status" : ""}`}><Icon name={hasRealAnalysis ? "check-circle" : "sparkles"} size={15} /> {hasRealAnalysis ? "Your result" : "Looking strong"}</span><p>{analysis?.summary ?? "Your resume is in great shape. A few small tweaks could help it stand out even more."}</p><button className="text-link" onClick={onUpload}>Improve your score <Icon name="arrow" size={16} /></button></div></div><div className="ats-foot"><Icon name="shield" size={15} /> {hasRealAnalysis ? "Based on your latest resume analysis" : "Example score · not based on a real resume"} <button aria-label="Learn about this score" onClick={() => onNavigate("resources")}><Icon name="external" size={14} /></button></div></section>
      <section className="card stat-card"><div className="card-heading"><div><span className="section-label">YOUR MOMENTUM</span><h2>Progress snapshot</h2></div><span className="stat-period"><Icon name="calendar" size={14} /> This month</span></div><div className="stat-grid"><div className="stat-item"><div className="stat-icon stat-icon-lavender"><Icon name="file" size={18} /></div><strong>{hasRealAnalysis ? analyses.filter((item) => !item.isSample).length : "03"}</strong><span>Resumes reviewed</span><small><span className="stat-trend"><Icon name="arrow-up" size={12} /> 1</span> this month</small></div><div className="stat-item"><div className="stat-icon stat-icon-mint"><Icon name="briefcase" size={18} /></div><strong>12</strong><span>Jobs discovered</span><small><span className="stat-trend"><Icon name="arrow-up" size={12} /> 4</span> this week</small></div><div className="stat-item"><div className="stat-icon stat-icon-peach"><Icon name="target" size={18} /></div><strong>82<span className="stat-suffix">%</span></strong><span>Average match</span><small><span className="stat-trend"><Icon name="arrow-up" size={12} /> 6%</span> vs last month</small></div></div><div className="snapshot-note"><span className="snapshot-note-icon"><Icon name="sparkles" size={16} /></span><span>You’re building great momentum. Keep it up!</span><span className="sample-inline">SAMPLE</span></div></section>
    </div>
    <div className="content-grid">
      <section className="card history-card"><div className="card-heading"><div><span className="section-label">PICK UP WHERE YOU LEFT OFF</span><h2>Recent analyses <SampleTag /></h2></div><button className="text-link" onClick={() => onNavigate("history")}>View all <Icon name="arrow" size={16} /></button></div><div className="analysis-list">{analyses.slice(0, 3).map((item) => <div className="analysis-row" key={item.id}><div className="analysis-file-icon"><Icon name="file" size={19} /></div><div className="analysis-main"><strong>{item.name}</strong><span>{item.role} <i /> {item.date}</span></div><div className="analysis-score"><span>{item.score}</span><small>/ 100</small></div><span className={`analysis-status${item.status === "Reviewed" ? " status-done" : ""}`}><i />{item.status}</span>{item.isSample && <span className="sr-only">Sample record</span>}</div>)}</div><button className="history-footer" onClick={() => onNavigate("history")}>See your full history <Icon name="arrow" size={16} /></button></section>
      <section className="card profile-card"><div className="card-heading"><div><span className="section-label">YOUR PROFILE</span><h2>Career snapshot</h2></div><button className="icon-button subtle-button" aria-label="Edit profile" onClick={() => onNavigate("profile")}><Icon name="external" size={17} /></button></div><div className="profile-summary"><div className="avatar avatar-large">AM</div><div><strong>Alex Morgan</strong><span>Product design student</span></div></div><div className="profile-completion"><div><span>Profile completeness</span><strong>72%</strong></div><div className="progress-track"><span style={{ width: "72%" }} /></div><small>Add your portfolio to reach 100%</small></div><div className="skill-block"><span className="section-label">TOP SKILLS <span className="sample-inline">SAMPLE</span></span><div className="skill-chips"><span>Figma</span><span>Prototyping</span><span>User research</span><span className="skill-more">+2</span></div></div><button className="profile-edit-link" onClick={() => onNavigate("profile")}>Complete your profile <Icon name="arrow" size={16} /></button></section>
    </div>
    <section className="card recommendations-card"><div className="card-heading recommendations-heading"><div><span className="section-label">HAND-PICKED FOR YOU</span><h2>Roles worth a closer look <SampleTag /></h2><p>Based on your interests and career profile.</p></div><button className="button button-outline" onClick={() => onNavigate("jobs")}>Explore all roles <Icon name="arrow" size={16} /></button></div><div className="job-grid">{sampleJobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} saved={savedJobs.includes(job.id)} onSave={onSaveJob} compact />)}</div></section>
  </>;
}

function JobCard({ job, saved, onSave, compact = false }: { job: Job; saved: boolean; onSave: (id: string) => void; compact?: boolean }) {
  return <article className={`job-card${compact ? " job-card-compact" : ""}`}><div className="job-card-top"><div className={`company-logo logo-${job.tone}`}>{job.initials}</div><button className={`icon-button save-button${saved ? " is-saved" : ""}`} aria-label={saved ? `Unsave ${job.role} at ${job.company}` : `Save ${job.role} at ${job.company}`} aria-pressed={saved} onClick={() => onSave(job.id)}><Icon name="bookmark" size={18} /></button></div><div className="job-match"><Icon name="sparkles" size={14} /> {job.match}% match <span className="sample-inline">SAMPLE</span></div><h3>{job.role}</h3><span className="job-company">{job.company}</span><div className="job-meta"><span><Icon name="globe" size={14} />{job.location}</span><span><Icon name="clock" size={14} />{job.type}</span></div>{!compact && <button className="button button-outline job-view-button" onClick={() => onSave(job.id)}>{saved ? "Saved to your list" : "Save opportunity"} <Icon name={saved ? "check" : "bookmark"} size={16} /></button>}</article>;
}

function UploadPage({ file, inputRef, dragging, isAnalyzing, apiConfigured, onInput, onDrop, onDragOver, onDragLeave, onChoose, onAnalyze, onClear, analysis, onNavigate }: {
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  dragging: boolean;
  isAnalyzing: boolean;
  apiConfigured: boolean;
  onInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onChoose: () => void;
  onAnalyze: () => void;
  onClear: () => void;
  analysis: { score: number; isSample: boolean; summary?: string } | null;
  onNavigate: (page: PageId) => void;
}) {
  return <><PageHeading eyebrow="A FRESH PERSPECTIVE" title="Let’s look at your resume." description="Get thoughtful, practical feedback to help your experience shine." /><div className="upload-layout"><section className="card upload-card"><div className="upload-card-heading"><div className="upload-step">01</div><div><h2>Upload your resume</h2><p>Choose the latest version you’d like us to review.</p></div></div><input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onInput} /><div className={`drop-zone${dragging ? " drop-zone-active" : ""}${file ? " drop-zone-has-file" : ""}`} onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); onDragOver(); }} onDragLeave={onDragLeave}>{file ? <><div className="drop-icon drop-icon-success"><Icon name="file" size={25} /></div><strong>{file.name}</strong><span>{(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to review</span><button className="text-link" onClick={onClear}>Remove file</button></> : <><div className="drop-icon"><Icon name="upload-cloud" size={26} /></div><strong>Drop your resume here</strong><span>or <button className="inline-button" onClick={onChoose}>browse files</button> from your device</span><small>PDF, DOC, or DOCX · Max 10 MB</small></>}</div>{!apiConfigured && <div className="demo-notice"><Icon name="shield" size={17} /><span><strong>Private demo mode</strong>Your file stays on this device. No resume analyzer is connected, so real analysis is unavailable.</span><SampleTag>NO BACKEND</SampleTag></div>}{analysis && !analysis.isSample && <div className="upload-result"><Icon name="check-circle" size={19} /><div><strong>Analysis complete · ATS score {analysis.score}/100</strong><span>{analysis.summary || "Your real results are now on your dashboard."}</span></div><button className="text-link" onClick={() => onNavigate("dashboard")}>View results</button></div>}<div className="upload-actions"><span><Icon name="lock" size={14} /> Your resume is handled securely.</span><button className="button button-primary" onClick={onAnalyze} disabled={isAnalyzing}>{isAnalyzing ? <><span className="button-spinner" /> Analyzing...</> : <>Analyze resume <Icon name="arrow" size={17} /></>}</button></div></section><aside className="card upload-aside"><div className="upload-aside-icon"><Icon name="sparkles" size={20} /></div><h3>What you’ll get</h3><p>A useful, honest look at how your resume communicates your experience.</p><ul><li><Icon name="check-circle" size={17} /><span>ATS compatibility insights</span></li><li><Icon name="check-circle" size={17} /><span>Skills and strengths overview</span></li><li><Icon name="check-circle" size={17} /><span>Practical next-step suggestions</span></li><li><Icon name="check-circle" size={17} /><span>Relevant role recommendations</span></li></ul><div className="upload-aside-note"><Icon name="shield" size={16} /> Your document is never used without your permission.</div></aside></div><div className="upload-bottom"><Icon name="sparkles" size={16} /><span>Want to get started without a resume?</span><button className="text-link" onClick={() => onNavigate("resources")}>Explore our career resources <Icon name="arrow" size={15} /></button></div></>;
}

function HistoryPage({ analyses, onUpload }: { analyses: AnalysisRecord[]; onUpload: () => void }) {
  const [filter, setFilter] = useState<"All" | "Real results" | "Sample data">("All");
  const visible = analyses.filter((item) => filter === "All" || (filter === "Sample data" ? item.isSample : !item.isSample));
  return <><PageHeading eyebrow="YOUR JOURNEY SO FAR" title="Analysis history" description="A record of your resume reviews and the progress you’ve made." action={<button className="button button-primary" onClick={onUpload}><Icon name="plus" size={18} /> New analysis</button>} /><section className="card history-page-card"><div className="history-toolbar"><div className="filter-tabs" role="group" aria-label="Filter analysis history">{(["All", "Real results", "Sample data"] as const).map((option) => <button key={option} className={filter === option ? "filter-active" : ""} onClick={() => setFilter(option)}>{option}</button>)}</div><span>{visible.length} {visible.length === 1 ? "review" : "reviews"}</span></div>{visible.length ? <div className="analysis-list history-full-list">{visible.map((item) => <div className="analysis-row" key={item.id}><div className="analysis-file-icon"><Icon name="file" size={19} /></div><div className="analysis-main"><strong>{item.name}</strong><span>{item.role} <i /> {item.date}</span></div><div className="analysis-score"><span>{item.score}</span><small>/ 100</small></div><span className={`analysis-status${item.status === "Reviewed" ? " status-done" : ""}`}><i />{item.status}</span><span className={item.isSample ? "history-sample" : "real-result"}>{item.isSample ? "Sample" : "Real result"}</span></div>)}</div> : <div className="empty-state"><div className="empty-state-icon"><Icon name="file" size={25} /></div><h2>No {filter.toLowerCase()} yet</h2><p>Your completed resume reviews will appear here.</p><button className="button button-primary" onClick={onUpload}>Upload a resume <Icon name="arrow" size={16} /></button></div>}</section></>;
}

function JobsPage({ jobs, savedJobs, onSave, search }: { jobs: Job[]; savedJobs: string[]; onSave: (id: string) => void; search: string }) {
  return <><PageHeading eyebrow="YOUR NEXT CHAPTER" title="Opportunities for you." description="A few thoughtful matches to get your search moving." /><div className="jobs-info-banner"><div className="jobs-info-icon"><Icon name="sparkles" size={20} /></div><div><strong>Matched to your interests</strong><span>Recommendations below use example profile data and are for illustration only.</span></div><SampleTag /></div>{jobs.length ? <div className="jobs-page-grid">{jobs.map((job) => <JobCard key={job.id} job={job} saved={savedJobs.includes(job.id)} onSave={onSave} />)}</div> : <div className="card empty-state"><div className="empty-state-icon"><Icon name="search" size={25} /></div><h2>No roles found</h2><p>Try a different search for roles, companies, or locations{search ? ` matching “${search}”` : ""}.</p></div>}</>;
}

function ResourcesPage() {
  const [saved, setSaved] = useState<string[]>([]);
  return <><PageHeading eyebrow="GROW AT YOUR OWN PACE" title="A little learning goes a long way." description="Thoughtful guides and practical tips for the next step in your career." /><div className="resource-feature"><div className="resource-feature-copy"><span className="hero-kicker"><Icon name="sparkles" size={14} /> A GOOD PLACE TO START</span><h2>Your experience is worth telling well.</h2><p>Build a resume that sounds like you, shows what you can do, and helps the right people notice.</p><button className="button button-light" onClick={() => document.getElementById("resource-list")?.scrollIntoView({ behavior: "smooth" })}>Explore the library <Icon name="arrow" size={16} /></button></div><div className="resource-feature-art"><div className="resource-book-art"><Icon name="book" size={39} /></div><div className="resource-art-star">✦</div></div></div><div className="resource-list-heading" id="resource-list"><div><span className="section-label">THE RESOURCE LIBRARY</span><h2>Made for your next step</h2></div><span className="sample-inline">EDITOR’S PICKS</span></div><div className="resource-grid">{resources.map((resource, index) => <article className="card resource-card" key={resource.title}><div className={`resource-icon resource-${resource.tone}`}><Icon name={resource.icon} size={20} /></div><div className="resource-category">{resource.category}</div><h3>{resource.title}</h3><p>{resource.description}</p><div className="resource-card-bottom"><span><Icon name="clock" size={14} /> {resource.duration}</span><button className={`text-link resource-save${saved.includes(resource.title) ? " resource-saved" : ""}`} onClick={() => setSaved((current) => current.includes(resource.title) ? current.filter((title) => title !== resource.title) : [...current, resource.title])}>{saved.includes(resource.title) ? "Saved" : "Save for later"} <Icon name={saved.includes(resource.title) ? "check" : "bookmark"} size={15} /></button></div><span className="resource-number">0{index + 1}</span></article>)}</div></>;
}

function ProfilePage({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return <><PageHeading eyebrow="YOUR STORY, YOUR WAY" title="My profile" description="A little about you helps us find opportunities that feel right." action={<button className="button button-primary" onClick={onSave}><Icon name={saved ? "check" : "check-circle"} size={17} /> {saved ? "Saved" : "Save changes"}</button>} /><div className="profile-page-grid"><section className="card profile-editor"><div className="profile-cover"><div className="profile-avatar-edit">AM<button aria-label="Update profile photo" onClick={onSave}><Icon name="plus" size={15} /></button></div></div><div className="profile-form"><div className="profile-form-title"><h2>Personal details</h2><span className="sample-inline">EXAMPLE PROFILE</span></div><div className="form-grid"><label>First name<input defaultValue="Alex" /></label><label>Last name<input defaultValue="Morgan" /></label><label className="form-full">Email address<input type="email" defaultValue="alex.morgan@example.com" /></label><label>Location<input defaultValue="Brooklyn, NY" /></label><label>Career stage<select defaultValue="student"><option value="student">Student</option><option value="early-career">Early career</option><option value="experienced">Experienced</option></select></label><label className="form-full">Headline<input defaultValue="Product design student · Curious problem solver" /></label><label className="form-full">About you<textarea defaultValue="I’m a product design student who loves turning complex ideas into simple, thoughtful experiences." rows={4} /></label></div><div className="form-section-divider" /><div className="profile-form-title"><h2>Skills & interests</h2><button className="text-link" onClick={onSave}><Icon name="plus" size={15} /> Add a skill</button></div><div className="profile-edit-skills"><span>Figma <button aria-label="Remove Figma skill" onClick={onSave}>×</button></span><span>Prototyping <button aria-label="Remove Prototyping skill" onClick={onSave}>×</button></span><span>User research <button aria-label="Remove User research skill" onClick={onSave}>×</button></span><span>Wireframing <button aria-label="Remove Wireframing skill" onClick={onSave}>×</button></span></div></div></section><aside className="card profile-completion-card"><div className="completion-illustration"><div><Icon name="sparkles" size={26} /></div><span>72%</span></div><h3>You’re off to a great start.</h3><p>A complete profile helps us find more thoughtful matches.</p><div className="progress-track"><span style={{ width: "72%" }} /></div><div className="completion-check"><Icon name="check-circle" size={17} /> Personal details <span>Done</span></div><div className="completion-check"><Icon name="check-circle" size={17} /> Skills & interests <span>Done</span></div><div className="completion-next"><Icon name="plus" size={16} /> Add your portfolio link</div><div className="completion-next"><Icon name="plus" size={16} /> Add work experience</div></aside></div></>;
}

function SettingsPage({ emailUpdates, onToggleEmail, onSave }: { emailUpdates: boolean; onToggleEmail: () => void; onSave: () => void }) {
  return <><PageHeading eyebrow="YOUR SPACE, YOUR SETTINGS" title="Make it yours." description="Set your preferences for how Orbit helps you move forward." action={<button className="button button-primary" onClick={onSave}><Icon name="check" size={17} /> Save preferences</button>} /><div className="settings-layout"><section className="card settings-card"><div className="settings-section-head"><div className="settings-icon"><Icon name="bell" size={19} /></div><div><h2>Notifications</h2><p>Choose which updates you’d like to hear about.</p></div></div><div className="settings-option"><div><strong>Career tips & updates</strong><span>Occasional ideas to help with your job search.</span></div><button className={`toggle${emailUpdates ? " toggle-on" : ""}`} role="switch" aria-checked={emailUpdates} aria-label="Career tips and updates" onClick={onToggleEmail}><i /></button></div><div className="settings-option"><div><strong>New role matches</strong><span>Let me know when relevant opportunities are added.</span></div><button className="toggle toggle-on" role="switch" aria-checked="true" aria-label="New role matches" onClick={onSave}><i /></button></div></section><section className="card settings-card"><div className="settings-section-head"><div className="settings-icon settings-icon-blue"><Icon name="lock" size={19} /></div><div><h2>Privacy & data</h2><p>You’re in control of your information.</p></div></div><div className="privacy-note"><Icon name="shield" size={19} /><div><strong>Your privacy matters.</strong><span>Your resume and personal details are only used to provide the features you choose. This demo stores no uploaded files.</span></div></div><button className="settings-row-button" onClick={onSave}><span><Icon name="download" size={17} /> Download my data</span><Icon name="chevron" size={16} /></button></section><section className="card settings-card settings-account"><div className="settings-section-head"><div className="settings-icon settings-icon-peach"><Icon name="user" size={19} /></div><div><h2>Account</h2><p>Your profile and sign-in information.</p></div></div><button className="settings-row-button" onClick={onSave}><span><Icon name="mail" size={17} /> alex.morgan@example.com</span><span className="settings-example">EXAMPLE</span></button><button className="settings-row-button" onClick={onSave}><span><Icon name="refresh" size={17} /> Manage connected accounts</span><Icon name="chevron" size={16} /></button></section></div></>;
}

export default App;