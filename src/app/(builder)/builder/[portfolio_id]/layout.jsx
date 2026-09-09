export const metadata = {
  title: 'Visual Drag & Drop Canvas Builder | PortfolioCraft',
  description: 'Interactive real-time drag and drop portfolio site editor.',
};

export default function BuilderLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {children}
    </div>
  );
}
