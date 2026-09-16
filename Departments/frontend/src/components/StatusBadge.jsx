import React from 'react';

export default function StatusBadge({ status }) {
  const isDraft = status?.toUpperCase() === 'DRAFT';
  return (
    <span className={`badge ${isDraft ? 'badge-draft' : 'badge-submitted'}`}>
      {status || 'DRAFT'}
    </span>
  );
}
