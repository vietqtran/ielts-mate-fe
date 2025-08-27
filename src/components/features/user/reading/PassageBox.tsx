import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';

const PassageBox = forwardRef<HTMLDivElement, { content: string }>(function PassageBox(
  { content },
  ref
) {
  const elRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => elRef.current as HTMLDivElement, []);
  useLayoutEffect(() => {
    if (elRef.current) {
      elRef.current.innerHTML = content || '';
    }
  }, [content]);
  return (
    <div
      ref={elRef}
      style={{ fontSize: '18px', lineHeight: '1.6' }}
      className='p-6 backdrop-blur-xl border rounded-2xl shadow-sm'
    />
  );
});

export default PassageBox;
