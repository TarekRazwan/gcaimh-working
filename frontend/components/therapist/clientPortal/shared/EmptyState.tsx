import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface EmptyStateProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLabel, onAction }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, px: 3, textAlign: 'center' }}>
    <Box sx={{ mb: 2, color: '#c4c7c5', '& .MuiSvgIcon-root': { fontSize: 48 } }}>
      {icon}
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 500, color: '#3c4043', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: '#5f6368', maxWidth: 320, mb: actionLabel ? 3 : 0 }}>
      {description}
    </Typography>
    {actionLabel && onAction && (
      <Button variant="outlined" onClick={onAction} sx={{ borderRadius: 2 }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
