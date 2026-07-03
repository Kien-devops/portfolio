'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundGlows from '@/components/BackgroundGlows';
import { Search, ShieldCheck, Ticket, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Voucher {
  id: number;
  name: string;
  vendor: 'AWS' | 'Microsoft' | 'Google Cloud';
  level: 'Foundational' | 'Associate' | 'Professional' | 'Expert';
  code: string;
  price: string;
  original: string;
  color: string;
  badgeUrl: string;
}

const ALL_VOUCHERS: Voucher[] = [
  // === AWS ===
  {
    id: 101,
    name: 'AWS Voucher Foundational (Có đủ mọi môn - Chỉ cần gửi mã môn cho Support)',
    vendor: 'AWS',
    level: 'Foundational',
    code: 'ANY-FND',
    price: '700,000 VND',
    original: '100 USD (~2,700,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png',
  },
  {
    id: 102,
    name: 'AWS Voucher Associate (Có đủ mọi môn - Chỉ cần gửi mã môn cho Support)',
    vendor: 'AWS',
    level: 'Associate',
    code: 'ANY-ASSOC',
    price: '1,500,000 VND',
    original: '150 USD (~4,050,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },
  {
    id: 1,
    name: 'AWS Cloud Practitioner - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Foundational',
    code: 'CLF-C02',
    price: '700,000 VND',
    original: '100 USD (~2,700,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png',
  },
  {
    id: 2,
    name: 'AWS Solutions Architect Associate - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Associate',
    code: 'SAA-C03',
    price: '1,500,000 VND',
    original: '150 USD (~4,050,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },
  {
    id: 3,
    name: 'AWS Developer Associate - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Associate',
    code: 'DVA-C02',
    price: '1,500,000 VND',
    original: '150 USD (~4,050,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/b9feab85-1a43-4f6c-99a5-631b88d5461b/image.png',
  },
  {
    id: 4,
    name: 'AWS CloudOps Engineer Associate - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Associate',
    code: 'SOA-C03',
    price: '1,500,000 VND',
    original: '150 USD (~4,050,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },
  {
    id: 35,
    name: 'AWS AI Practitioner - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Foundational',
    code: 'AIF-C01',
    price: '700,000 VND',
    original: '100 USD (~2,700,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png',
  },
  {
    id: 36,
    name: 'AWS Data Engineer Associate - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Associate',
    code: 'DEA-C01',
    price: '1,500,000 VND',
    original: '150 USD (~4,050,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },
  {
    id: 37,
    name: 'AWS Machine Learning Engineer Associate - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Associate',
    code: 'MLA-C01',
    price: '1,500,000 VND',
    original: '150 USD (~4,050,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },
  {
    id: 301,
    name: 'AWS DevOps Engineer Professional - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Professional',
    code: 'DOP-C02',
    price: '3,800,000 VND',
    original: '300 USD (~8,100,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },
  {
    id: 302,
    name: 'AWS Solutions Architect Professional - Voucher Giảm Giá 100%',
    vendor: 'AWS',
    level: 'Professional',
    code: 'SAP-C02',
    price: '3,800,000 VND',
    original: '300 USD (~8,100,000 VND)',
    color: '#FF9900',
    badgeUrl: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },

  // === MICROSOFT AZURE ===
  {
    id: 501,
    name: 'Azure Fundamentals - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Foundational',
    code: 'AZ-900',
    price: '1,600,000 VND',
    original: '99 USD (~2,673,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg',
  },
  {
    id: 502,
    name: 'Azure Data Fundamentals - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Foundational',
    code: 'DP-900',
    price: '1,600,000 VND',
    original: '99 USD (~2,673,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg',
  },
  {
    id: 503,
    name: 'Azure Administrator - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Associate',
    code: 'AZ-104',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 504,
    name: 'Azure Developer - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Associate',
    code: 'AZ-204',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 505,
    name: 'Azure Security Engineer - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Associate',
    code: 'AZ-500',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 506,
    name: 'Azure Data Engineer - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Associate',
    code: 'DP-203',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 507,
    name: 'Power BI Data Analyst - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Associate',
    code: 'PL-300',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#F2C811',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 508,
    name: 'Azure Data Scientist - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Associate',
    code: 'DP-100',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 509,
    name: 'Azure Database Administrator - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Associate',
    code: 'DP-300',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
  },
  {
    id: 510,
    name: 'Azure Solutions Architect Expert - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Expert',
    code: 'AZ-305',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-expert-badge.svg',
  },
  {
    id: 511,
    name: 'Azure DevOps Engineer Expert - Voucher Giảm Giá 100%',
    vendor: 'Microsoft',
    level: 'Expert',
    code: 'AZ-400',
    price: '1,600,000 VND',
    original: '165 USD (~4,455,000 VND)',
    color: '#0078D4',
    badgeUrl: 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-expert-badge.svg',
  },

  // === GOOGLE CLOUD ===
  {
    id: 601,
    name: 'Google Cloud Digital Leader - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Foundational',
    code: 'CDL',
    price: '2,180,000 VND',
    original: '99 USD (~2,673,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 602,
    name: 'Google Cloud Associate Cloud Engineer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Associate',
    code: 'ACE',
    price: '2,180,000 VND',
    original: '125 USD (~3,375,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 603,
    name: 'Google Cloud Professional Cloud Architect - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PCA',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 604,
    name: 'Google Cloud Professional Data Engineer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PDE',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 605,
    name: 'Google Cloud Professional Cloud Developer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PCD',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 606,
    name: 'Google Cloud Professional Cloud Security Engineer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PCSE',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 607,
    name: 'Google Cloud Professional Cloud DevOps Engineer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PCDE',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 608,
    name: 'Google Cloud Professional Cloud Network Engineer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PCNE',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 609,
    name: 'Google Cloud Professional Machine Learning Engineer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PMLE',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
  {
    id: 610,
    name: 'Google Cloud Professional Collaboration Engineer - Voucher Giảm Giá 100%',
    vendor: 'Google Cloud',
    level: 'Professional',
    code: 'PCE',
    price: '2,180,000 VND',
    original: '200 USD (~5,400,000 VND)',
    color: '#4285F4',
    badgeUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
  },
];

export default function ExamVouchersPage() {
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const vendors = ['All', 'AWS', 'Microsoft', 'Google Cloud'];
  const levels = ['All', 'Foundational', 'Associate', 'Professional', 'Expert'];

  const filteredVouchers = ALL_VOUCHERS.filter((v) => {
    const matchesVendor = selectedVendor === 'All' || v.vendor === selectedVendor;
    const matchesLevel = selectedLevel === 'All' || v.level === selectedLevel;
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase());
    return matchesVendor && matchesLevel && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <BackgroundGlows />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 space-y-12 animate-fade-up"
      >
        {/* Header Block */}
        <section className="relative space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Genuine Discount Vouchers</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Exam Vouchers
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed font-medium">
            Tiết kiệm chi phí thi các chứng chỉ quốc tế chính hãng AWS, Google Cloud và Microsoft Azure bằng các mã giảm giá 100%.
          </p>
        </section>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 bg-card border border-card-border p-5 rounded-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search bar */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc mã exam..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-card-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
            </div>

            {/* Vendor Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {vendors.map((vendor) => (
                <button
                  key={vendor}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all border cursor-pointer ${
                    selectedVendor === vendor
                      ? 'bg-accent text-white border-accent shadow-md shadow-accent/10'
                      : 'bg-card border-card-border text-text-muted hover:text-foreground'
                  }`}
                >
                  {vendor === 'Microsoft' ? 'AZURE' : vendor.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 justify-start border-t border-card-border/60 pt-3">
            <span className="text-xs font-mono font-bold text-text-muted self-center mr-2">LEVEL:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider transition-all border cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card border-card-border text-text-muted hover:text-foreground'
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Vouchers Grid */}
        <AnimatePresence mode="popLayout">
          {filteredVouchers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-card border border-card-border rounded-2xl"
            >
              <Ticket className="w-12 h-12 mx-auto text-text-muted opacity-40 mb-3" />
              <p className="text-text-muted font-medium">Không tìm thấy voucher phù hợp.</p>
            </motion.div>
          ) : (
            <motion.section
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredVouchers.map((voucher) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={voucher.id}
                  className="group relative bg-card border border-card-border rounded-[24px] hover:border-accent/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col overflow-hidden"
                >
                  {/* Color strip on top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: voucher.color }}
                  />

                  {/* Top Header Card Info */}
                  <div className="p-5 pb-3 flex justify-between items-start z-10 relative">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-foreground/5 dark:bg-white/5 border border-card-border text-[9px] font-bold uppercase tracking-wider text-text-muted">
                      {voucher.level}
                    </span>

                    {/* Logo/Badge space */}
                    <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                      <img
                        src={voucher.badgeUrl}
                        alt={voucher.code}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Mid Content */}
                  <div className="px-5 py-2 flex-1 flex flex-col z-10 relative">
                    <h3 className="text-2xl font-black tracking-tight text-foreground mb-1">
                      {voucher.code}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: voucher.color }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        {voucher.vendor === 'Microsoft' ? 'AZURE' : voucher.vendor}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-muted group-hover:text-foreground transition-colors leading-relaxed line-clamp-3">
                      {voucher.name}
                    </p>
                  </div>

                  {/* Price & Action footer */}
                  <div className="p-5 pt-4 bg-foreground/2 dark:bg-white/1 border-t border-card-border/60 flex flex-col justify-end group-hover:bg-accent/[0.02] dark:group-hover:bg-accent/[0.05] transition-colors duration-300">
                    <span className="text-[10px] text-text-dim line-through mb-1">
                      Giá gốc: {voucher.original}
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-accent">
                        {voucher.price}
                      </span>
                      <a
                        href="https://www.facebook.com/kiennguly24"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-card-border text-text-muted group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all duration-300 hover:scale-110"
                        title="Liên hệ mua qua Facebook"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.main>

      <Footer />
    </>
  );
}
