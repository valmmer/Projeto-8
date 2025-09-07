import * as React from 'react';

// Aceita TODOS os atributos nativos de <button>
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'subtle';
  isLoading?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    isLoading = false,
    type = 'button', // ✅ padrão: não envia submit
    className = '',
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const base =
    'btn inline-flex items-center justify-center rounded-2xl px-4 py-2 transition';
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'btn-primary',
    secondary: 'btn-outline',
    ghost: 'btn-ghost',
    subtle: 'btn-subtle',
  };

  const disabledLook =
    disabled || isLoading
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${disabledLook} ${className}`}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading ? true : undefined}
      {...rest}
    >
      {isLoading ? '…' : children}
    </button>
  );
});

export default Button;
