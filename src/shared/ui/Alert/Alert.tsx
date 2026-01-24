import { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
} from '@/shared/ui/ui/alert-dialog';

import { Button } from '../ui/button';
import { BUTTON } from './style';

export interface AlertPropsType {
  title: ReactNode | string;
  headerClassName?: string;
  children: ReactNode | string;
  buttonSlot?: ReactNode | ReactNode[];
  onClick?: () => void;
}

/**
 * Alert 공통컴포넌트 
 * - RCC에서만 사용
 * @example
 * setModal(
      <Alert
        title="로그인이 필요한 서비스에요."
        buttonSlot={
          <>
            <Button className={BUTTON.CANCEL}>이전으로</Button>
            <Button className={BUTTON.ACTION}>로그인</Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <span className="text-grayscale700 text-lg font-semibold">
            로그인 후 다시 시도해주세요.
          </span>
          <div className="flex items-center gap-2 justify-center text-sm">
            <span className="text-grayscale700">
              아직 회원이 아니신가요?
            </span>
            <span
              className="cursor-pointer underline text-blue400"
              onClick={() => {
                onClose();

                router.push(PATH.join);
              }}
            >
              회원가입
            </span>
          </div>
        </div>
      </Alert>,
    );
 */
const Alert = (props: AlertPropsType) => {
  const { title, headerClassName, children, buttonSlot, onClick } = props;

  return (
    <AlertDialog open={true}>
      <AlertDialogOverlay />
      <AlertDialogContent className="p-0">
        <AlertDialogHeader className={cn('px-4 pt-9', headerClassName)}>
          <AlertDialogTitle className="text-center text-xl text-grayscale900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="hidden" />
        </AlertDialogHeader>
        <div className="px-4 pb-4 text-center">{children}</div>
        <AlertDialogFooter className="grid w-full grid-cols-1 px-0">
          <div className="-mx-[0.075rem] -mb-[0.075rem]">
            {buttonSlot || (
              <>
                <Button onClick={onClick} className={BUTTON.ACTION}>
                  확인
                </Button>
              </>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
