import React from 'react';
import { Chip, Tooltip } from '@mui/material';

const colors = {
  admin: 'error',
  editor: 'primary',
  author: 'default'
};

export default function RoleBadge({ role }) {
  if (!role) return null;
  const normalized = role.toLowerCase();
  return (
    <Tooltip title={`You are logged in as ${normalized}`}> 
      <Chip label={normalized} color={colors[normalized] || 'default'} size="small" sx={{ textTransform:'capitalize', fontWeight:600 }} />
    </Tooltip>
  );
}
