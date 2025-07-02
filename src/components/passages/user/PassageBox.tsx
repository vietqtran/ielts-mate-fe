const PassageBox = ({ content }: { content: string }) => {
  return (
    <div
      style={{ fontSize: '18px', lineHeight: '1.6' }}
      dangerouslySetInnerHTML={{ __html: content }}
      className='p-4 text-gray-700'
    />
  );
};

export default PassageBox;
