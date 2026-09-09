'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/builder/Navbar';
import Canvas from '@/components/builder/Canvas';
import {
  BoxIcon,
  PlusIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from '@/components/ui/Icons';

export default function BuilderPage({ params }) {
  const unwrappedParams = use(params);
  const portfolioId = unwrappedParams.portfolio_id || 'd0000000-0000-0000-0000-000000000001';

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const activeSection = sections.find((s) => s.id === activeSectionId) || null;

  const fetchBuilderData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/builder?portfolioId=${portfolioId}`);
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.portfolio);
        setSections(data.sections || []);
        setIsPublished(data.portfolio?.isPublished ?? true);
        if (data.sections?.length > 0 && !activeSectionId) {
          setActiveSectionId(data.sections[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilderData();
  }, [portfolioId]);

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const next = [...sections];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSections(next);
    saveOrder(next.map((s) => s.id));
  };

  const handleMoveDown = (index) => {
    if (index >= sections.length - 1) return;
    const next = [...sections];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSections(next);
    saveOrder(next.map((s) => s.id));
  };

  const saveOrder = async (orderedIds) => {
    try {
      await fetch('/api/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder_sections',
          portfolioId,
          orderedSectionIds: orderedIds,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSection = async (type) => {
    const templates = {
      HERO: { title: 'Hero Introduction', contentData: { headline: 'New Hero Headline', subheadline: 'Engineering description...', ctaText: 'Explore Work' } },
      ABOUT: { title: 'About Me', contentData: { bio: 'Crafting digital experiences with attention to detail.' } },
      EXPERIENCE: { title: 'Career Timeline', contentData: { heading: 'Work History & Achievements' } },
      BLOG: { title: 'Case Studies & Blog', contentData: { heading: 'Recent Articles' } },
      APPOINTMENT: { title: 'Appointment Booking', contentData: { heading: 'Schedule a Consultation Session' } },
      REVIEWS: { title: 'Client Reviews', contentData: { heading: 'Verified Testimonials' } },
      CONTACT: { title: 'Contact', contentData: { email: 'contact@example.com' } },
      CUSTOM: { title: 'Custom Section', contentData: { text: 'Custom layout section.' } },
    };

    const template = templates[type] || templates.CUSTOM;
    try {
      const res = await fetch('/api/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_section',
          portfolioId,
          sectionData: {
            moduleType: type,
            title: template.title,
            contentData: template.contentData,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSections([...sections, data.section]);
        setActiveSectionId(data.section.id);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      await fetch('/api/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_section', portfolioId, id }),
      });
      const remaining = sections.filter((s) => s.id !== id);
      setSections(remaining);
      if (activeSectionId === id) setActiveSectionId(remaining[0]?.id || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateActiveSection = async (updates) => {
    if (!activeSection) return;
    const updated = { ...activeSection, ...updates };
    setSections(sections.map((s) => (s.id === activeSection.id ? updated : s)));

    try {
      await fetch('/api/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_section',
          portfolioId,
          id: activeSection.id,
          updates,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async () => {
    const nextState = !isPublished;
    setIsPublished(nextState);
    try {
      await fetch('/api/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish_portfolio',
          portfolioId,
          isPublished: nextState,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      <Navbar subdomain={portfolio?.subdomain || 'alex-design'} />

      {/* Sub-bar */}
      <div className="sticky top-16 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-tight">Visual Drag-and-Drop Studio</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400">
            Tenant: <strong className="text-white font-mono">{portfolio?.subdomain || 'alex-design'}</strong>
          </span>

          {savedSuccess && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Canvas Saved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport switch */}
          <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
            {['desktop', 'tablet', 'mobile'].map((vp) => (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                  viewport === vp ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {vp}
              </button>
            ))}
          </div>

          <button
            onClick={handleTogglePublish}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isPublished
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {isPublished ? 'Live: Published' : 'Draft Mode'}
          </button>

          <a
            href={`/sites/${portfolio?.subdomain || 'alex-design'}`}
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <span>Preview Live</span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3-Column Studio */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PALETTE */}
        <aside className="w-64 border-r border-white/10 bg-slate-900/40 p-4 space-y-4 overflow-y-auto hidden lg:block shrink-0">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Modules</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Click to insert into canvas</p>
          </div>

          <div className="space-y-2">
            {[
              { type: 'HERO', label: 'Hero Banner', desc: 'Headline, subhead & CTA buttons' },
              { type: 'ABOUT', label: 'About & Bio', desc: 'Career bio & stats counters' },
              { type: 'EXPERIENCE', label: 'Experience Timeline', desc: 'Work history & career milestones' },
              { type: 'BLOG', label: 'Blog & Case Studies', desc: 'Articles & technical breakdowns' },
              { type: 'APPOINTMENT', label: 'Appointments Module', desc: 'Interactive client booking slot' },
              { type: 'REVIEWS', label: 'Client Reviews', desc: '1-5 star ratings & testimonials' },
              { type: 'CONTACT', label: 'Contact', desc: 'Direct outreach & socials' },
              { type: 'CUSTOM', label: 'Custom Block', desc: 'Freeform text layout' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddSection(item.type)}
                className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-indigo-400">{item.label}</span>
                  <PlusIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER CANVAS */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 flex flex-col items-center">
          <div
            className={`w-full transition-all duration-300 ${
              viewport === 'tablet'
                ? 'max-w-2xl border-x border-white/10 p-4 bg-slate-950/60 shadow-2xl rounded-2xl'
                : viewport === 'mobile'
                ? 'max-w-sm border-x border-white/10 p-3 bg-slate-950/60 shadow-2xl rounded-2xl'
                : 'max-w-5xl'
            }`}
          >
            <Canvas
              sections={sections}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDeleteSection={handleDeleteSection}
              themeConfig={portfolio?.themeConfig || {}}
            />
          </div>
        </section>

        {/* RIGHT INSPECTOR */}
        <aside className="w-80 border-l border-white/10 bg-slate-900/40 p-5 space-y-5 overflow-y-auto hidden md:block shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Inspector</span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              {activeSection ? activeSection.title : 'Select a Section'}
            </h3>
            <p className="text-xs text-slate-400">Edit module copy and layout</p>
          </div>

          {activeSection ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Section Label</label>
                <input
                  type="text"
                  value={activeSection.title || ''}
                  onChange={(e) => handleUpdateActiveSection({ title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Text Alignment</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        handleUpdateActiveSection({
                          styles: { ...(activeSection.styles || {}), textAlign: align },
                        })
                      }
                      className={`py-1 rounded-lg capitalize font-medium ${
                        activeSection.styles?.textAlign === align
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Content Fields */}
              {activeSection.contentData?.headline !== undefined && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Headline</label>
                  <textarea
                    rows={2}
                    value={activeSection.contentData?.headline || ''}
                    onChange={(e) =>
                      handleUpdateActiveSection({
                        contentData: { ...activeSection.contentData, headline: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              {activeSection.contentData?.subheadline !== undefined && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subheadline</label>
                  <textarea
                    rows={2}
                    value={activeSection.contentData?.subheadline || ''}
                    onChange={(e) =>
                      handleUpdateActiveSection({
                        contentData: { ...activeSection.contentData, subheadline: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              {activeSection.contentData?.bio !== undefined && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bio Text</label>
                  <textarea
                    rows={4}
                    value={activeSection.contentData?.bio || ''}
                    onChange={(e) =>
                      handleUpdateActiveSection({
                        contentData: { ...activeSection.contentData, bio: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              {activeSection.contentData?.heading !== undefined && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Heading</label>
                  <input
                    type="text"
                    value={activeSection.contentData?.heading || ''}
                    onChange={(e) =>
                      handleUpdateActiveSection({
                        contentData: { ...activeSection.contentData, heading: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              {activeSection.contentData?.email !== undefined && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="text"
                    value={activeSection.contentData?.email || ''}
                    onChange={(e) =>
                      handleUpdateActiveSection({
                        contentData: { ...activeSection.contentData, email: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-center text-slate-400 text-xs">
              Select any section on the canvas to customize its content and styles.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
