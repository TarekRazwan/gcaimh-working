import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Chip, Paper,
  Button, Skeleton, Alert, Tabs, Tab, Menu, MenuItem,
} from '@mui/material';
import { Search, Send, MenuBook, FitnessCenter } from '@mui/icons-material';
import { useTherapistBridge } from '../../../../contexts/TherapistClientBridgeContext';
import { ModuleForAssignment, InterventionForAssignment } from '../../../../types/therapistClientBridge';
import EmptyState from '../shared/EmptyState';

interface ContentPanelProps {
  clientId: string;
  onAssignHomework: (moduleId?: string) => void;
  onAssignIntervention: (interventionId?: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  COGNITIVE: '#e8f0fe', EMOTIONAL: '#fce8e6', BEHAVIORAL: '#e6f4ea', TRAUMA: '#fef7e0', GENERAL: '#f1f3f4',
};
const CATEGORY_TEXT: Record<string, string> = {
  COGNITIVE: '#0b57d0', EMOTIONAL: '#b3261e', BEHAVIORAL: '#128937', TRAUMA: '#b16300', GENERAL: '#5f6368',
};
const TYPE_LABEL: Record<string, string> = {
  BREATHWORK: 'Breathwork', GROUNDING: 'Grounding', COGNITIVE: 'Cognitive', EXPOSURE: 'Exposure',
  MINDFULNESS: 'Mindfulness', BODY_AWARENESS: 'Body', SOUND: 'Sound', METACOGNITIVE: 'Meta', MOVEMENT: 'Movement',
};

function ModuleCard({ mod, onSend }: { mod: ModuleForAssignment; onSend: (id: string) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1f1f1f', mb: 0.5 }}>{mod.title}</Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
            <Chip label={mod.category} size="small" sx={{ height: 20, fontSize: '11px', bgcolor: CATEGORY_COLORS[mod.category] ?? '#f1f3f4', color: CATEGORY_TEXT[mod.category] ?? '#5f6368' }} />
            <Typography variant="caption" color="text.secondary">{mod.estimatedMinutes} min</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>{mod.summary}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
            {mod.tags.slice(0, 3).map(t => <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 18, fontSize: '11px' }} />)}
          </Box>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Send sx={{ fontSize: '14px !important' }} />}
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{ borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Send
        </Button>
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { onSend(mod.id); setAnchorEl(null); }}>
          <MenuBook fontSize="small" sx={{ mr: 1 }} /> Assign as homework
        </MenuItem>
      </Menu>
    </Paper>
  );
}

function InterventionCard({ tool, onSend }: { tool: InterventionForAssignment; onSend: (id: string) => void }) {
  const durMin = tool.durationSeconds ? Math.round(tool.durationSeconds / 60) : null;
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1f1f1f', mb: 0.5 }}>{tool.title}</Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
            <Chip label={TYPE_LABEL[tool.type] ?? tool.type} size="small" variant="outlined" sx={{ height: 20, fontSize: '11px' }} />
            {durMin && <Typography variant="caption" color="text.secondary">{durMin} min</Typography>}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>{tool.description}</Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Send sx={{ fontSize: '14px !important' }} />}
          onClick={() => onSend(tool.id)}
          sx={{ borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Assign
        </Button>
      </Box>
    </Paper>
  );
}

const ContentPanel: React.FC<ContentPanelProps> = ({ clientId, onAssignHomework, onAssignIntervention }) => {
  const bridge = useTherapistBridge();
  const [modules, setModules] = useState<ModuleForAssignment[]>([]);
  const [tools, setTools] = useState<InterventionForAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([bridge.listModulesForAssignment(), bridge.listInterventionsForAssignment()])
      .then(([m, t]) => { setModules(m); setTools(t); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  const q = query.toLowerCase();
  const filteredModules = modules.filter(m =>
    !q || m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q))
  );
  const filteredTools = tools.filter(t =>
    !q || t.title.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  );

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} />)}</Box>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Could not load content: {error}</Alert>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f' }}>Send module to client</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
          Search the library and assign a module or tool directly to this client's portal.
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Search modules or tools…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        sx={{ maxWidth: 400 }}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 36 }}>
        <Tab label={`Modules (${filteredModules.length})`} sx={{ fontSize: '13px', minHeight: 36, py: 0 }} />
        <Tab label={`Tools (${filteredTools.length})`} sx={{ fontSize: '13px', minHeight: 36, py: 0 }} />
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {tab === 0 && (
          filteredModules.length === 0
            ? <EmptyState icon={<MenuBook />} title="No modules match" description='Try a different search term.' />
            : filteredModules.map(m => <ModuleCard key={m.id} mod={m} onSend={id => onAssignHomework(id)} />)
        )}
        {tab === 1 && (
          filteredTools.length === 0
            ? <EmptyState icon={<FitnessCenter />} title="No tools match" description='Try a different search term.' />
            : filteredTools.map(t => <InterventionCard key={t.id} tool={t} onSend={id => onAssignIntervention(id)} />)
        )}
      </Box>
    </Box>
  );
};

export default ContentPanel;
