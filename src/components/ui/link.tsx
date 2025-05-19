import Link from 'next/link';

interface Props {
  href: string;
  text: string;
}

const CustomLink = ({ href, text }: Props) => {
  return (
    <Link href={href} className='font-medium text-sm text-[#1e4ae9] hover:underline'>
      {text}
    </Link>
  );
};

export default CustomLink;
