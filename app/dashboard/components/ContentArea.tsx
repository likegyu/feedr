'use client';

import React from 'react';
import Dashboard from './contents/Dashboard';
import InstagramConnect from './contents/InstagramConnect';
import PCFeedSettings from './contents/PCFeedSettings';
import MobileFeedSettings from './contents/MobileFeedSettings';
import Notices from './contents/Notices';
import ApiDocs from './contents/ApiDocs';

interface Cafe24ContentAreaProps {
  selectedMenu: string;
  cafe24MallId: string | null;
  cafe24StoreName: string;
}

const ContentArea: React.FC<Cafe24ContentAreaProps> = ({
  selectedMenu,
  cafe24MallId,
  cafe24StoreName
}) => {
  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard mallId={cafe24MallId} storeName={cafe24StoreName} />;
      case 'instagram':
        return <InstagramConnect />;
      case 'pc-feed-settings':
        return <PCFeedSettings />;
      case 'mobile-feed-settings':
        return <MobileFeedSettings />;
      case 'notices':
        return <Notices />;
      case 'api-docs':
        return <ApiDocs />;
      default:
        return <Dashboard mallId={cafe24MallId} storeName={cafe24StoreName} />;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default ContentArea;
