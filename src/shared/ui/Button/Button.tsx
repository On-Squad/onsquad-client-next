import { Loader2 } from 'lucide-react';

import { type ButtonProps, Button as LibButton } from '../ui/button';

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const Button = ({ children, isLoading = false, ...props }: CustomButtonProps) => {
  return (
    <LibButton disabled={isLoading} variant="default" size="default" {...props}>
      {isLoading ? <Loader2 className="animate-spin" /> : children}
    </LibButton>
  );
};

export { Button };
