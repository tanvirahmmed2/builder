'use client';

import { BiBriefcase, BiMapPin } from 'react-icons/bi';

export default function TenantExperiences({ experiences = [], skills = [], primaryColor = '#6366f1' }) {
  return (
    <section id="experiences" className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800"
            style={{ color: primaryColor }}
          >
            Track Record & Career
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Work Experience & Skills
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            A chronological timeline of roles, engineering leadership, and applied technical proficiencies.
          </p>
        </div>

        {/* Skills Pills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
            {skills.map((skill, idx) => (
              <div
                key={skill.id || idx}
                className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
              >
                <span>{skill.name}</span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {skill.proficiency || 90}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {experiences.length > 0 ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:-ml-px">
            {experiences.map((exp, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={exp.id || idx}
                  className={`relative flex items-center md:justify-between ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Marker */}
                  <div
                    className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs shadow-md z-10"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <BiBriefcase />
                  </div>

                  {/* Content Card */}
                  <div className="ml-12 md:ml-0 md:w-[45%] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {exp.role_title}
                      </h3>
                      {exp.is_current && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {exp.organization}
                      </strong>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <BiMapPin className="text-sm" />
                          <span>{exp.location}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {exp.description}
                    </p>

                    {Array.isArray(exp.skills_used) && exp.skills_used.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {exp.skills_used.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            No work experience entries published yet.
          </div>
        )}
      </div>
    </section>
  );
}
