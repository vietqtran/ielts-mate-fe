import { Ring } from 'ldrs/react';

const LoadingSpinner = ({ color = 'white' }: { color?: string }) => {
  return <Ring size='16' stroke='2' bgOpacity='0' speed='2' color={color} />;
};

export default LoadingSpinner;
