import { type VariantProps, cva } from 'class-variance-authority';

/**
 * apps/web/src/shared/ui/ui/button.tsx 의 cva 블록 복사본.
 *
 * 웹 파일을 직접 import 하지 않는 이유:
 *   1. 그 파일이 @radix-ui/react-slot 을 import 해 RN 번들에 딸려 온다
 *   2. shared/ui/ui/ 는 shadcn 원본이라 수정 금지 대상이다
 *
 * 원본에서 뺀 것은 `disabled:` 세 개뿐이다 —
 * NativeWind 에 disabled: variant 가 없어 조용히 무시되기 때문이다.
 * 비활성 스타일은 Button.tsx 가 isDisabled prop 으로 처리한다.
 *
 * `hover:` 는 그대로 둔다. 모바일 웹에서도 hover 는 뜨지 않으므로 "웹과 동일"이 이미 성립한다.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:outline-primary [-webkit-tap-highlight-color:transparent] touch-manipulation',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active focus:border-primary focus-visible:border-primary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-primary text-primary bg-background active:bg-accent/30',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-gray-200',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
