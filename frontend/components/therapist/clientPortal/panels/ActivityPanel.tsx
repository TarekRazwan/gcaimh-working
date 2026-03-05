import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Alert, Chip } from '@mui/material';
import {
  MenuBook, FitnessCenter, Publish, VisibilityOff, CheckCircle, Archive,
} from '@mui/icons-material';
import { useTherapistBridge } from '../../../../contexts/TherapistClientBridgeContext';
import { ActivityEvent, ActivityEventType } from '../../../../types/therapistClientBridge';
import EmptyState from '../shared/EmptyState';
import { History } from '@mui/icons-material';

interface ActivityPanelProps {
  clientId: string;
  refreshKey: number;
}

const EVENT_META: Record<ActivityEventType, { icon: React.ReactElement; color: string; label: string }> = {
  HOMEWORK_ASSIGNED:    { icon: <MenuBook sx={{ fontSize: 16 }} />,      color: '#0b57d0', label: 'Homework assigned' },
  HOMEWORK_COMPLETED:   { icon: <CheckCircle sx={{ fontSize: 16 }} />,   color: '#128937', label: 'Homework completed' },
  HOMEWORK_ARCHIVED:    { icon: <Archive sx={{ fontSize: 16 }} />,       color: '#5f6368', label: 'Homework archived' },
  HOMEWORK_RESCHEDULED: { icon: <MenuBook sx={{ fontSize: 16 }} />,      color: '#f59e0b', label: 'Homework rescheduled' },
  INTERVENTION_ASSIGNED:{ icon: <FitnessCenter sx={{ fontSize: 16 }} />, color: '#6750a4', label: 'Tool assigned' },
  INTERVENTION_ARCHIVED:{ icon: <Archive sx={{ fontSize: 16 }} />,       color: '#5f6368', label: 'Tool archived' },
  SUMMARY_PUBLISHED:    { icon: <Publish sx={{ fontSize: 16 }} />,       color: '#128937', label: 'Summary published' },
  SUMMARY_UNPUBLISHED:  { icon: <VisibilityOff sx={{ fontSize: 16 }} />, color: '#b3261e', label: 'Summary unpublished' },
  MODULE_SENT:          { icon: <MenuBook sx={{ fontSize: 16 }} />,      color: '#00639b', label: 'Module sent' },
};

function formatTs(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ clientId, refreshKey }) => {
  const bridge = useTherapistBridge();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    bridge.listActivityEvents(clientId)
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [clientId, refreshKey]);

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={56} />)}</Box>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Could not load activity: {error}</Alert>;
  if (events.length === 0) return <EmptyState icon={<History />} title="No activity yet" description="Actions taken in the client portal will be logged here." />;

  return (
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f', mb: 2 }}>Activity timeline</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {events.map((evt, i) => {
          const meta = EVENT_META[evt.type] ?? EVENT_META.HOMEWORK_ASSIGNED;
          const isLast = i === events.length - 1;
          return (
            <Box key={evt.id} sx={{ display: 'flex', gap: 2 }}>
              {/* Timeline line */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 32 }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%', bgcolor: `${meta.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: meta.color, flexShrink: 0,
                }}>
                  {meta.icon}
                </Box>
                {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: '#f0f4f9', my: 0.25 }} />}
              </Box>
              {/* Content */}
              <Box sx={{ flex: 1, pb: isLast ? 0 : 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '13px', color: '#1f1f1f', fontWeight: 500 }}>
                    {evt.description}
                  </Typography>
                  <Chip
                    label={evt.actor}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '10px', color: evt.actor === 'therapist' ? '#0b57d0' : '#128937', borderColor: evt.actor === 'therapist' ? '#0b57d0' : '#128937' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">{formatTs(evt.timestamp)}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ActivityPanel;
