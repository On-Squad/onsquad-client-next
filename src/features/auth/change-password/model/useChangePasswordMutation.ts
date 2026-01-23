import { useApiMutation } from '@/shared/lib/queries';
import { changePasswordPatchFetch } from '@/shared/api/user/changePasswordPatchFetch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/lib/hooks/useToast';
import { TOAST } from '@/shared/config/toast';
import { CircleCheck, CircleX } from 'lucide-react';
import { PATH } from '@/shared/config/paths';

export const useChangePasswordMutation = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useApiMutation({
    fetcher: changePasswordPatchFetch,
    options: {
      onSuccess: (data) => {
        if (data.status === 204) {
          toast({
            title: '비밀번호 변경에 성공했어요.',
            className: TOAST.success,
            icon: CircleCheck,
          });

          router.push(PATH.root, { scroll: false });
        } else {
          toast({
            title: '비밀번호 변경에 실패했어요.',
            className: TOAST.error,
            icon: CircleX,
          });
        }
      },
    },
  });
};
