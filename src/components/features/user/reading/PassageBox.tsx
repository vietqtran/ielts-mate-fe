const PassageBox = ({ content }: { content: string }) => {
  return (
    <div
      style={{ fontSize: '18px', lineHeight: '1.6' }}
      dangerouslySetInnerHTML={{ __html: content }}
      className='p-6 backdrop-blur-xl border rounded-2xl shadow-sm'
    />
  );
};

export default PassageBox;
