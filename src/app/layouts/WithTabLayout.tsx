import { Appbar } from '@/shared/ui/Appbar';
import { BottomTab } from '@/shared/ui/BottomTab';

const WithTabLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div id="wrapper">
      <Appbar />
      <div className="container mt-20 h-[calc(100dvh-9.5rem)] !overflow-y-auto bg-gray-50 px-5">{children}</div>
      <BottomTab />
      <div className="mx-auto h-20 min-w-[20rem] max-w-[45rem] bg-gray-50" />
    </div>
  );
};

export default WithTabLayout;
