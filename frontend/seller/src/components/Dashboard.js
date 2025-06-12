import React from 'react';
import { motion } from 'react-magic-motion';
import BusinessStats from './dashboard/BusinessStats';
import QuickActions from './dashboard/QuickActions';
import RecentActivity from './dashboard/RecentActivity';
import { SELLER_TEXTS } from '../utils/localization';

const Dashboard = React.memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold mb-2">{SELLER_TEXTS.DASHBOARD}</h1>
          <p className="text-blue-100 text-lg">{SELLER_TEXTS.BUSINESS_OVERVIEW}</p>
        </motion.div>
      </div>

      {/* Business Statistics */}
      <BusinessStats />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity />
    </motion.div>
  );
});

export default Dashboard;
