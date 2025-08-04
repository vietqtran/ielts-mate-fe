const PassageBox = ({ content }: { content: string }) => {
  return (
    <div
      style={{ fontSize: '18px', lineHeight: '1.6' }}
      dangerouslySetInnerHTML={{ __html: content }}
      className='p-6 text-[#003b73] bg-white/90 backdrop-blur-xl border border-[#60a3d9]/30 rounded-3xl shadow-2xl ring-1 ring-[#60a3d9]/20'
    />
  );
};

export default PassageBox;
