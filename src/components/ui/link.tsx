import Link from 'next/link';
import React from 'react';

interface Props extends React.ComponentProps<'a'> {
  href: string;
  text: string;
}

const CustomLink = ({ href, text, ...rest }: Props) => {
  return (
    <Link href={href} className='font-medium text-sm text-[#1e4ae9] hover:underline' {...rest}>
      {text}
    </Link>
  );
};

export default CustomLink;
