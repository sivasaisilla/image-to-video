import { useState, useEffect } from "react";
import svgPaths from "@/imports/svg-nqiqmt8jqs";

interface DashboardHeaderProps {
  onNavigateToProjects?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onLogout?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToReferral?: () => void;
  activePage?: 'create' | 'projects' | 'plans' | 'referral';
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  company: string;
  bio: string;
  profileImageUrl: string;
  subscriptionPlan: string;
  createdAt: string;
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 86 97">
        <g clipPath="url(#clip0_4010_131)">
          <g>
            <path d={svgPaths.p1fc0d980} fill="white" />
            <path d={svgPaths.p3fa59880} fill="white" />
            <path d={svgPaths.p24ace280} fill="white" />
          </g>
          <g>
            <path d={svgPaths.p11a6300} fill="url(#paint0_linear_4010_131)" />
            <path d={svgPaths.p3fa59880} fill="url(#paint1_linear_4010_131)" />
          </g>
          <path d={svgPaths.p31d8dc80} fill="white" />
          <path d={svgPaths.p9680300} fill="white" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4010_131" x1="43" x2="43" y1="30" y2="144">
            <stop stopColor="#FF8300" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_4010_131" x1="43" x2="43" y1="30" y2="144">
            <stop stopColor="#FF8300" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <clipPath id="clip0_4010_131">
            <rect fill="white" height="97" width="86" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full flex flex-col leading-tight">
        <span className="tracking-wider text-sm">IMOB</span>
        <span className="tracking-wider text-sm">MOTION</span>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-[151.578px]" data-name="Container">
      <Icon />
      <Text />
    </div>
  );
}

type LinkTextProps = {
  text: string;
  onClick?: () => void;
  isActive?: boolean;
};

function LinkText({ text, onClick, isActive = false }: LinkTextProps) {
  return (
    <button 
      onClick={onClick}
      className={`relative shrink-0 transition-all rounded-[999px] ${isActive ? 'bg-white px-6 py-3' : 'hover:opacity-80 pr-[10px]'}`}
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center gap-[10px] relative">
        {isActive && (
          <div className="relative shrink-0 size-[14px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <circle cx="7" cy="7" fill="var(--fill-0, black)" id="Ellipse 1" r="7" />
            </svg>
          </div>
        )}
        <p className={`font-['Poppins:Regular',sans-serif] leading-[22.5px] not-italic relative shrink-0 text-[16px] text-nowrap tracking-[-0.2344px] ${isActive ? 'text-black' : 'text-[rgba(255,255,255,0.8)]'}`}>{text}</p>
      </div>
    </button>
  );
}

function Link({ onClick, activePage }: { onClick?: () => void; activePage?: 'create' | 'projects' | 'plans' }) {
  const isActive = activePage === 'create';
  
  return (
    <button 
      onClick={onClick}
      className={`relative rounded-[999px] shrink-0 transition-all ${isActive ? 'bg-white hover:bg-white/90' : 'bg-transparent hover:opacity-80'}`} 
      data-name="Link"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center justify-center px-[16px] py-[12px] relative">
        {isActive && (
          <div className="relative shrink-0 size-[14px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <circle cx="7" cy="7" fill="var(--fill-0, black)" id="Ellipse 1" r="7" />
            </svg>
          </div>
        )}
        <p className={`font-['Poppins:Regular',sans-serif] leading-[22.5px] not-italic relative shrink-0 text-[16px] text-nowrap tracking-[-0.2344px] ${isActive ? 'text-black' : 'text-[rgba(255,255,255,0.8)]'}`}>Create</p>
      </div>
    </button>
  );
}

function Navigation({ 
  onNavigateToProjects, 
  onNavigateToCreate,
  onNavigateToPlans,
  onNavigateToReferral,
  activePage 
}: { 
  onNavigateToProjects?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToReferral?: () => void;
  activePage?: 'create' | 'projects' | 'plans' | 'referral';
}) {
  return (
    <div className="h-[22.5px] relative shrink-0" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[80px] h-full items-center relative">
        <Link onClick={onNavigateToCreate} activePage={activePage} />
        <LinkText text="Projects" onClick={onNavigateToProjects} isActive={activePage === 'projects'} />
        <LinkText text="Refer a agent" onClick={onNavigateToReferral} isActive={activePage === 'referral'} />
        <LinkText text="Plans" onClick={onNavigateToPlans} isActive={activePage === 'plans'} />
      </div>
    </div>
  );
}

function Container1({ 
  onNavigateToProjects, 
  onNavigateToCreate,
  onNavigateToPlans,
  onNavigateToReferral,
  activePage 
}: { 
  onNavigateToProjects?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToReferral?: () => void;
  activePage?: 'create' | 'projects' | 'plans' | 'referral';
}) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Navigation 
        onNavigateToProjects={onNavigateToProjects} 
        onNavigateToCreate={onNavigateToCreate}
        onNavigateToPlans={onNavigateToPlans}
        onNavigateToReferral={onNavigateToReferral}
        activePage={activePage}
      />
    </div>
  );
}

function Header({ 
  onNavigateToProjects, 
  onNavigateToCreate,
  onNavigateToPlans,
  onNavigateToReferral,
  activePage 
}: { 
  onNavigateToProjects?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToReferral?: () => void;
  activePage?: 'create' | 'projects' | 'plans' | 'referral';
}) {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex flex-col items-center justify-center px-[10px] py-[20px] relative rounded-[999px] shrink-0 mx-[10px] my-[0px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <Container1 
        onNavigateToProjects={onNavigateToProjects} 
        onNavigateToCreate={onNavigateToCreate}
        onNavigateToPlans={onNavigateToPlans}
        onNavigateToReferral={onNavigateToReferral}
        activePage={activePage}
      />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p67f12c8} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2c19cb00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[3.35544e+07px] shrink-0 size-[32px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Text1({ userName }: { userName?: string }) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-start relative">
        <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-white">{userName || 'User'}</p>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[16px] relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-start relative">
        <p className="font-['Poppins:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)] text-center text-nowrap">Creator</p>
      </div>
    </div>
  );
}

function Container3({ userName }: { userName?: string }) {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start relative shrink-0" data-name="Container">
      <Text1 userName={userName} />
      <Text2 />
    </div>
  );
}

function Icon2({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={`relative shrink-0 size-[16px] transition-transform ${isOpen ? 'rotate-180' : ''}`} data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Frame({ isOpen, setIsOpen, userName }: { isOpen: boolean; setIsOpen: (open: boolean) => void; userName?: string }) {
  return (
    <button 
      onClick={() => setIsOpen(!isOpen)}
      className="content-stretch flex gap-[12px] items-center relative shrink-0 hover:opacity-80 transition-opacity"
    >
      <Container3 userName={userName} />
      <Icon2 isOpen={isOpen} />
    </button>
  );
}

function Frame1({ 
  isOpen, 
  setIsOpen,
  onNavigateToProjects,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToPlans,
  onLogout
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void;
  onNavigateToProjects?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToPlans?: () => void;
  onLogout?: () => void;
}) {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm('Çıkış yapmak istediğinizden emin misiniz?');
    if (confirmed) {
      onLogout?.();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
        <Container2 />
        <Frame isOpen={isOpen} setIsOpen={setIsOpen} userName={profileData?.fullName} />
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-[220px] backdrop-blur-md bg-[#131519]/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Menu Items */}
          <div className="py-2">
            <button 
              onClick={() => {
                onNavigateToProfile?.();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-white/80 hover:bg-gradient-to-r hover:from-amber-400/10 hover:to-orange-400/5 hover:text-white transition-all flex items-center gap-3 group"
            >
              <svg className="w-4 h-4 text-white/60 group-hover:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
              <span className="text-sm">Profile</span>
            </button>
            
            <button 
              onClick={() => {
                onNavigateToSettings?.();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-white/80 hover:bg-gradient-to-r hover:from-amber-400/10 hover:to-orange-400/5 hover:text-white transition-all flex items-center gap-3 group"
            >
              <svg className="w-4 h-4 text-white/60 group-hover:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span className="text-sm">Settings</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="border-t border-white/10"></div>
          
          {/* Logout */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-3 group"
            >
              <svg className="w-4 h-4 text-red-400/60 group-hover:text-red-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="text-sm">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header1({ 
  onNavigateToProjects,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToPlans,
  onLogout
}: { 
  onNavigateToProjects?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToPlans?: () => void;
  onLogout?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex flex-col h-[62.5px] items-center justify-center px-[24px] py-[20px] relative rounded-[999px] shrink-0" data-name="Header">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <Frame1 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        onNavigateToProjects={onNavigateToProjects}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSettings={onNavigateToSettings}
        onNavigateToPlans={onNavigateToPlans}
        onLogout={onLogout}
      />
    </div>
  );
}

export function DashboardHeader({ 
  onNavigateToProjects,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout,
  onNavigateToCreate,
  onNavigateToPlans,
  onNavigateToReferral,
  activePage
}: DashboardHeaderProps) {
  return (
    <div className="relative w-full">
      <div className="flex flex-row items-center w-full">
        <div className="content-stretch flex items-center justify-between px-[50px] py-0 relative w-full">
          <Container />
          <Header 
            onNavigateToProjects={onNavigateToProjects} 
            onNavigateToCreate={onNavigateToCreate} 
            onNavigateToPlans={onNavigateToPlans}
            onNavigateToReferral={onNavigateToReferral}
            activePage={activePage} 
          />
          <Header1 
            onNavigateToProjects={onNavigateToProjects}
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToSettings={onNavigateToSettings}
            onNavigateToPlans={onNavigateToPlans}
            onLogout={onLogout}
          />
        </div>
      </div>
    </div>
  );
}