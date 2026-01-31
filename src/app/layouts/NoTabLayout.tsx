import React from 'react';

const NoTabLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      id="no-tab-wrapper"
      className="fixed inset-x-0 top-14 mx-auto h-[calc(100vh-3.5rem)] max-w-[45rem] overflow-y-auto bg-[#f8f8f8]"
    >
      <div className="mx-auto mt-12 px-5 pb-5">{children}</div>
    </div>
  );
};

export default NoTabLayout;
