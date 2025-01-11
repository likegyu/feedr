'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Dashboard from './contents/Dashboard';
import InstagramConnect from './contents/InstagramConnect';
import PCFeedSettings from './contents/PCFeedSettings';
import MobileFeedSettings from './contents/MobileFeedSettings';
import Notices from './contents/Notices';
import ApiDocs from './contents/ApiDocs';

interface Cafe24ContentAreaProps {
  selectedMenu: string;
  cafe24MallId: string | null;
  cafe24ShopName: string;
}

const ContentArea: React.FC<Cafe24ContentAreaProps> = ({
  selectedMenu,
  cafe24MallId,
  cafe24ShopName
}) => {
  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard cafe24MallId={cafe24MallId} cafe24ShopName={cafe24ShopName} />;
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
        return <Dashboard cafe24MallId={cafe24MallId} cafe24ShopName={cafe24ShopName} />;
    }
  };

  return (
    <ScrollArea className="flex-1 p-6 h-dvh">
      {renderContent()}
    </ScrollArea>
  );
};

export default ContentArea;
