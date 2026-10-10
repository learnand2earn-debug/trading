import React from 'react';
import { V1Scalping } from './V1Scalping.js';

export const Dashboard: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
  return <V1Scalping navigate={navigate} />;
};
