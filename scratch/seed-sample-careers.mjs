import { queryDb } from '../src/lib/db/pg.js';

async function seed() {
  try {
    const adminDev = await queryDb('SELECT id FROM developers LIMIT 1');
    const devId = adminDev.rows.length > 0 ? adminDev.rows[0].id : null;

    const sql = `
      INSERT INTO career (
        title, slug, department, job_type, workplace_type, location,
        experience_level, salary_range, description, requirements,
        responsibilities, benefits, is_published, is_featured, created_by_developer_id
      ) VALUES 
      (
        'Senior Full-Stack Engineer',
        'senior-full-stack-engineer',
        'Engineering',
        'FULL_TIME',
        'REMOTE',
        'Remote (Worldwide)',
        'SENIOR',
        '$90,000 - $130,000 / year',
        'We are looking for an experienced Senior Full-Stack Engineer to lead development of our real-time portfolio builder studio, high-performance edge rendering, and developer APIs.',
        '• 4+ years of professional experience with React, Next.js, and Node.js\n• Strong PostgreSQL relational database design and query optimization skills\n• Experience building high-performance drag-and-drop or visual canvas applications\n• Passion for writing clean, modular, and maintainable software architecture',
        '• Architect and build scalable front-end and back-end modules for the website builder\n• Optimize page load speeds, database latency, and Cloudinary media processing\n• Collaborate closely with product designers and platform engineers\n• Mentor junior developers and participate in code reviews',
        '• 100% Remote flexibility with flexible working hours\n• Annual technology and home office stipend\n• Comprehensive health, dental, and vision insurance\n• Generous stock options and equity participation\n• Unlimited paid time off (PTO) and company retreat',
        TRUE,
        TRUE,
        $1
      ),
      (
        'Lead UI/UX Product Designer',
        'lead-ui-ux-product-designer',
        'Design & UX',
        'FULL_TIME',
        'REMOTE',
        'Remote (Worldwide)',
        'LEAD',
        '$85,000 - $115,000 / year',
        'Join us as Lead Product Designer to craft intuitive, world-class user experiences for our website builder studio, templates marketplace, and creator dashboards.',
        '• 5+ years of UI/UX design experience for SaaS or creative tools\n• Mastery of Figma, design systems, auto-layout, and micro-interaction prototyping\n• Deep understanding of responsive layout principles and modern typography\n• Strong portfolio demonstrating end-to-end design of complex web applications',
        '• Own the design system and visual component library across the platform\n• Design intuitive, friction-free drag-and-drop site building workflows\n• Conduct user research, usability testing, and prototype iterative improvements\n• Partner with engineers to ensure pixel-perfect implementation of layouts',
        '• 100% Remote flexibility\n• Top-of-the-line MacBook Pro + 4K monitor stipend\n• Generous learning, conferences, and design books budget\n• Health, dental, and wellness memberships\n• Competitive salary and equity package',
        TRUE,
        FALSE,
        $1
      )
      ON CONFLICT (slug) DO NOTHING;
    `;

    await queryDb(sql, [devId]);
    console.log('Seeded sample career listings successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
