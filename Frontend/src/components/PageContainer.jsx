export default function PageContainer({ children }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-[#07121b] p-8 rounded-lg shadow-lg border border-[#12304a]">
        {children}
      </div>
    </main>
  );
}
