import React from 'react';
import { SOURCE_COLORS } from '../../utils/constants';

const SourceBadge = ({ source }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
      SOURCE_COLORS[source] ?? 'bg-gray-100 text-gray-600'
    }`}
  >
    {source}
  </span>
);

export default SourceBadge;
