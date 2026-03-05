import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Switch, FormControlLabel, Button, Paper,
  Chip, Skeleton, Alert, Divider, List, ListItem, ListItemText,
} from '@mui/material';
import { Visibility, Publish, VisibilityOff } from '@mui/icons-material';
import { useTherapistBridge } from '../../../../contexts/TherapistClientBridgeContext';
import { PublishDraft, PublishSections } from '../../../../types/therapistClientBridge';
import EmptyState from '../shared/EmptyState';

interface PublishPanelProps {
  clientId: string;
}

const SECTION_LABELS: Record<keyof PublishSections, string> = {
  themes: 'Session themes',
  keyMoments: 'Key moments',
  homeworkList: 'Homework list',
  riskLabel: 'Risk level label',
  nextSteps: 'Next steps',
};

function PreviewPane({ draft }: { draft: PublishDraft }) {
  const { sections, content } = draft;
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Visibility sx={{ fontSize: 16, color: '#5f6368' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368' }}>
          Client view preview
        </Typography>
      </Box>

      {sections.themes && content.themes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#1f1f1f', mb: 0.75 }}>Session Themes</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {content.themes.map((t, i) => <Chip key={i} label={t} size="small" variant="outlined" />)}
          </Box>
        </Box>
      )}

      {sections.keyMoments && content.keyMoments.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#1f1f1f', mb: 0.75 }}>Key Moments</Typography>
          <List dense disablePadding>
            {content.keyMoments.map((m, i) => (
              <ListItem key={i} sx={{ pl: 0, py: 0.25 }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#0b57d0', mr: 1.5, flexShrink: 0, mt: '6px' }} />
                <ListItemText primary={m} primaryTypographyProps={{ fontSize: '13px', color: '#3c4043' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {sections.homeworkList && content.homeworkList.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#1f1f1f', mb: 0.75 }}>Between-Session Plan</Typography>
          <List dense disablePadding>
            {content.homeworkList.map((h, i) => (
              <ListItem key={i} sx={{ pl: 0, py: 0.25 }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#128937', mr: 1.5, flexShrink: 0, mt: '6px' }} />
                <ListItemText primary={h} primaryTypographyProps={{ fontSize: '13px', color: '#3c4043' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {sections.nextSteps && content.nextSteps.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#1f1f1f', mb: 0.75 }}>Next Steps</Typography>
          <List dense disablePadding>
            {content.nextSteps.map((s, i) => (
              <ListItem key={i} sx={{ pl: 0, py: 0.25 }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f59e0b', mr: 1.5, flexShrink: 0, mt: '6px' }} />
                <ListItemText primary={s} primaryTypographyProps={{ fontSize: '13px', color: '#3c4043' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {sections.riskLabel && content.riskLabel && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Risk level visible to client: </Typography>
          <Chip label={content.riskLabel} size="small" sx={{ ml: 0.5, height: 20, fontSize: '11px' }} />
        </Box>
      )}

      {!sections.themes && !sections.keyMoments && !sections.homeworkList && !sections.nextSteps && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No sections selected — nothing will be visible to the client.
        </Typography>
      )}
    </Paper>
  );
}

const PublishPanel: React.FC<PublishPanelProps> = ({ clientId }) => {
  const bridge = useTherapistBridge();
  const [draft, setDraft] = useState<PublishDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setLoading(true);
    bridge.getPublishDraft(clientId)
      .then(setDraft)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  const handleSectionToggle = async (key: keyof PublishSections) => {
    if (!draft) return;
    const updated = await bridge.updatePublishDraft(clientId, draft.id, {
      sections: { ...draft.sections, [key]: !draft.sections[key] },
    });
    setDraft(updated);
  };

  const handlePublish = async () => {
    if (!draft) return;
    setPublishing(true);
    try {
      await bridge.publishToClient(clientId, draft.id);
      const updated = await bridge.getPublishDraft(clientId);
      setDraft(updated);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!draft) return;
    setPublishing(true);
    try {
      await bridge.unpublishFromClient(clientId, draft.id);
      const updated = await bridge.getPublishDraft(clientId);
      setDraft(updated);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={60} />)}</Box>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Could not load draft: {error}</Alert>;
  if (!draft) return (
    <EmptyState icon={<Publish />} title="No session summary draft" description="A patient-safe summary will appear here after a session is processed." />
  );

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f' }}>
            What the client will see
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
            Session {draft.sessionDate ? formatDate(draft.sessionDate) : draft.sessionId} · Toggle sections below, then publish.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {draft.published ? (
            <Chip icon={<Publish sx={{ fontSize: '14px !important' }} />} label="Published" color="success" size="small" />
          ) : (
            <Chip label="Draft" size="small" variant="outlined" />
          )}
          {draft.publishedAt && (
            <Typography variant="caption" color="text.secondary">{formatDate(draft.publishedAt)}</Typography>
          )}
        </Box>
      </Box>

      {/* Section toggles */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>
          Include in client summary
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {(Object.keys(SECTION_LABELS) as (keyof PublishSections)[]).map(key => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={draft.sections[key]}
                  onChange={() => handleSectionToggle(key)}
                  size="small"
                  color="primary"
                />
              }
              label={<Typography sx={{ fontSize: '14px' }}>{SECTION_LABELS[key]}</Typography>}
              sx={{ ml: 0 }}
            />
          ))}
        </Box>
      </Paper>

      {/* Preview toggle */}
      <Button
        variant="text"
        startIcon={showPreview ? <VisibilityOff /> : <Visibility />}
        onClick={() => setShowPreview(p => !p)}
        sx={{ alignSelf: 'flex-start', color: '#5f6368' }}
      >
        {showPreview ? 'Hide preview' : 'Preview as client'}
      </Button>

      {showPreview && <PreviewPane draft={draft} />}

      <Divider />

      {/* Publish controls */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {draft.published ? (
          <Button
            variant="outlined"
            color="error"
            startIcon={<VisibilityOff />}
            onClick={handleUnpublish}
            disabled={publishing}
            sx={{ borderRadius: 2 }}
          >
            Unpublish from client portal
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<Publish />}
            onClick={handlePublish}
            disabled={publishing}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #0b57d0 0%, #00639b 100%)' }}
          >
            Publish to client
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PublishPanel;
