import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Chip, Paper, Skeleton, Alert,
  Divider, Menu, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import {
  Add, CheckCircle, Schedule, Archive, MoreVert, FitnessCenter, MenuBook,
} from '@mui/icons-material';
import { useTherapistBridge } from '../../../../contexts/TherapistClientBridgeContext';
import { TherapistHomeworkItem, TherapistInterventionAssignment } from '../../../../types/therapistClientBridge';
import EmptyState from '../shared/EmptyState';

interface PlanPanelProps {
  clientId: string;
  onAssignHomework: () => void;
  onAssignIntervention: () => void;
  refreshKey: number;
}

const STATUS_COLOR: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  ASSIGNED: 'info', IN_PROGRESS: 'warning', COMPLETED: 'success', ARCHIVED: 'default',
};
const FREQ_LABEL: Record<string, string> = {
  DAILY: 'Daily', TWICE_DAILY: 'Twice daily', AS_NEEDED: 'As needed', WEEKLY: 'Weekly',
};

function HomeworkCard({ item, onStatusChange }: { item: TherapistHomeworkItem; onStatusChange: (id: string, status: any) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  const isOverdue = item.dueAt && item.status !== 'COMPLETED' && item.status !== 'ARCHIVED' && new Date(item.dueAt) < new Date();

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: isOverdue ? '#f59e0b' : '#e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1f1f1f' }}>
              {item.moduleTitle}
            </Typography>
            <Chip label={item.status.replace('_', ' ')} size="small" color={STATUS_COLOR[item.status]} sx={{ height: 20, fontSize: '11px' }} />
            {isOverdue && <Chip label="Overdue" size="small" color="warning" sx={{ height: 20, fontSize: '11px' }} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">{item.moduleCategory} · {item.estimatedMinutes} min</Typography>
            {item.dueAt && (
              <Typography variant="caption" color={isOverdue ? 'warning.main' : 'text.secondary'}>
                Due {formatDate(item.dueAt)}
              </Typography>
            )}
            {item.progress?.lastOpenedAt && (
              <Typography variant="caption" color="text.secondary">Last opened {formatDate(item.progress.lastOpenedAt)}</Typography>
            )}
          </Box>
          {item.note && (
            <Typography variant="caption" sx={{ color: '#5f6368', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
              Note: {item.note}
            </Typography>
          )}
        </Box>
        {item.status !== 'ARCHIVED' && (
          <>
            <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
              {item.status !== 'COMPLETED' && (
                <MenuItem onClick={() => { onStatusChange(item.id, 'COMPLETED'); setAnchorEl(null); }}>
                  <CheckCircle fontSize="small" sx={{ mr: 1, color: '#128937' }} /> Mark complete
                </MenuItem>
              )}
              <MenuItem onClick={() => { onStatusChange(item.id, 'ARCHIVED'); setAnchorEl(null); }}>
                <Archive fontSize="small" sx={{ mr: 1 }} /> Archive
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Paper>
  );
}

function InterventionCard({ item, onArchive }: { item: TherapistInterventionAssignment; onArchive: (id: string) => void }) {
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1f1f1f' }}>{item.interventionTitle}</Typography>
            <Chip label={item.interventionType.replace('_', ' ')} size="small" variant="outlined" sx={{ height: 20, fontSize: '11px' }} />
            {item.frequency && <Chip label={FREQ_LABEL[item.frequency]} size="small" sx={{ height: 20, fontSize: '11px', bgcolor: '#e8f0fe', color: '#0b57d0' }} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">Assigned {formatDate(item.assignedAt)}</Typography>
            {item.recentUsageCount !== undefined && (
              <Typography variant="caption" color="text.secondary">{item.recentUsageCount}× used (last 7 days)</Typography>
            )}
          </Box>
          {item.note && (
            <Typography variant="caption" sx={{ color: '#5f6368', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
              Note: {item.note}
            </Typography>
          )}
        </Box>
        {item.status === 'ACTIVE' && (
          <Tooltip title="Archive">
            <IconButton size="small" onClick={() => onArchive(item.id)}>
              <Archive fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
}

const PlanPanel: React.FC<PlanPanelProps> = ({ clientId, onAssignHomework, onAssignIntervention, refreshKey }) => {
  const bridge = useTherapistBridge();
  const [homework, setHomework] = useState<TherapistHomeworkItem[]>([]);
  const [interventions, setInterventions] = useState<TherapistInterventionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([bridge.listClientHomework(clientId), bridge.listClientInterventions(clientId)])
      .then(([hw, iv]) => { setHomework(hw); setInterventions(iv); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [clientId, refreshKey]);

  const handleStatusChange = async (id: string, status: any) => {
    await bridge.updateHomeworkStatus(clientId, id, status);
    const updated = await bridge.listClientHomework(clientId);
    setHomework(updated);
  };

  const handleArchiveIntervention = async (id: string) => {
    await bridge.archiveIntervention(clientId, id);
    const updated = await bridge.listClientInterventions(clientId);
    setInterventions(updated);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} />)}
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Could not load plan: {error}</Alert>;

  const activeHomework = homework.filter(h => h.status !== 'ARCHIVED');
  const activeInterventions = interventions.filter(i => i.status === 'ACTIVE');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Homework */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f' }}>
              Homework Modules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
              Psychoeducation modules assigned between sessions.
            </Typography>
          </Box>
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={onAssignHomework} sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}>
            Assign homework
          </Button>
        </Box>
        {activeHomework.length === 0 ? (
          <EmptyState
            icon={<MenuBook />}
            title="No homework assigned"
            description="Assign a psychoeducation module for the client to review between sessions."
            actionLabel="Assign homework"
            onAction={onAssignHomework}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {activeHomework.map(h => (
              <HomeworkCard key={h.id} item={h} onStatusChange={handleStatusChange} />
            ))}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Interventions */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f' }}>
              Tools & Interventions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
              Therapeutic tools assigned for between-session practice.
            </Typography>
          </Box>
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={onAssignIntervention} sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}>
            Assign tool
          </Button>
        </Box>
        {activeInterventions.length === 0 ? (
          <EmptyState
            icon={<FitnessCenter />}
            title="No tools assigned"
            description="Assign a therapeutic tool or intervention for the client to practice."
            actionLabel="Assign tool"
            onAction={onAssignIntervention}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {activeInterventions.map(i => (
              <InterventionCard key={i.id} item={i} onArchive={handleArchiveIntervention} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PlanPanel;
