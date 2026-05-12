import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
      STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'
    }`}
  >
    {status}
  </span>
);

export default StatusBadge;
