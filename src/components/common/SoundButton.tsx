import React from 'react';
import { Link } from 'react-router-dom';
import { useSound } from '../../hooks/useSound';
import { cn } from '../../utils/cn';

interface BaseSoundButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface ButtonProps extends BaseSoundButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  to?: never;
}

interface LinkProps extends BaseSoundButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  as: 'link';
  to: string;
}

type SoundButtonProps = ButtonProps | LinkProps;

export const SoundButton: React.FC<SoundButtonProps> = ({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  as,
  to,
  ...props
}) => {
  const { playHoverSound } = useSound();

  const baseStyles = 'transition-all duration-300 rounded-lg focus:outline-none';
  const variantStyles = {
    primary: 'bg-[#9945FF] hover:bg-[#14F195] text-white font-bold',
    secondary: 'bg-gray-800/80 hover:bg-gray-700/80 text-white',
    ghost: 'bg-transparent hover:bg-gray-700/20 text-white'
  };
  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    widthStyles,
    className
  );

  if (as === 'link' && to) {
    return (
      <Link
        to={to}
        className={combinedClassName}
        onMouseEnter={playHoverSound}
        {...(props as LinkProps)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={combinedClassName}
      onMouseEnter={playHoverSound}
      {...(props as ButtonProps)}
    >
      {children}
    </button>
  );
};
