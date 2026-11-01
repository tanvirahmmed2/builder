const fs = require('fs');

// 1. Navbar.jsx
let nav = fs.readFileSync('src/components/saas/home/bar/Navbar.jsx', 'utf8');
nav = nav.replace(/Ecosystem Apps Dropdown/g, 'Ecosystem Services Dropdown');
nav = nav.replace(/href="\/apps"/g, 'href="/services"');
nav = nav.replace(/<span>Apps<\/span>/g, '<span>Services</span>');
nav = nav.replace(/`\/apps\/\$\{a\.slug\}`/g, '`/services/${a.slug}`');
fs.writeFileSync('src/components/saas/home/bar/Navbar.jsx', nav, 'utf8');

// 2. Sidebar.jsx
let side = fs.readFileSync('src/components/saas/home/bar/Sidebar.jsx', 'utf8');
side = side.replace(/\{\/\* Apps with expandable sub-items \*\/\}/g, '{/* Services with expandable sub-items */}');
side = side.replace(/href="\/apps"/g, 'href="/services"');
side = side.replace(/Apps\s*<\/Link>/g, 'Services</Link>');
side = side.replace(/`\/apps\/\$\{app\.slug\}`/g, '`/services/${app.slug}`');
side = side.replace(/Toggle apps sub-menu/g, 'Toggle services sub-menu');
fs.writeFileSync('src/components/saas/home/bar/Sidebar.jsx', side, 'utf8');

// 3. Footer.jsx
let foot = fs.readFileSync('src/components/saas/home/bar/Footer.jsx', 'utf8');
foot = foot.replace(/href="\/apps"/g, 'href="/services"');
foot = foot.replace(/Ecosystem Apps/g, 'Ecosystem Services');
fs.writeFileSync('src/components/saas/home/bar/Footer.jsx', foot, 'utf8');

console.log('Successfully updated Navbar, Sidebar, and Footer!');

