import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GithubSocialButtonProps {
  text?: string;
}

const GithubSocialButton = ({ text }: GithubSocialButtonProps) => {
  return (
    <Button
      type='button'
      className='flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border px-4 py-2 text-sm font-medium'
      onClick={() => {
        toast('Facebook sign-up would be triggered here.');
      }}
    >
      <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 16 16'>
        <path
          fill='white'
          fillRule='evenodd'
          d='M8.01 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.7 5.47 7.78c.398.082.543-.176.543-.394c0-.19-.013-.842-.013-1.52c-2.23.489-2.69-.978-2.69-.978c-.358-.951-.888-1.2-.888-1.2c-.73-.502.053-.502.053-.502c.809.054 1.23.842 1.23.842c.716 1.25 1.87.896 2.33.679c.066-.53.278-.896.504-1.1c-1.78-.19-3.65-.896-3.65-4.05c0-.896.318-1.63.822-2.2c-.08-.204-.358-1.05.08-2.17c0 0 .676-.217 2.2.842a7.5 7.5 0 0 1 4 0c1.52-1.06 2.2-.842 2.2-.842c.438 1.13.159 1.97.08 2.17c.516.57.821 1.3.821 2.2c0 3.15-1.87 3.84-3.66 4.05c.292.258.543.747.543 1.52c0 1.1-.013 1.98-.013 2.25c0 .217.146.476.543.394c3.18-1.09 5.47-4.16 5.47-7.78c.013-4.54-3.58-8.2-7.99-8.2z'
          clipRule='evenodd'
        />
      </svg>
      {text ?? 'Continue with Github'}
    </Button>
  );
};

export default GithubSocialButton;
