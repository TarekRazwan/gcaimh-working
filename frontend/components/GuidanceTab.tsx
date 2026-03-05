// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { HealthAndSafety, NaturePeople, Category, Exposure, Psychology } from '@mui/icons-material';

interface GuidanceTabProps {
  currentGuidance: {
    title: string;
    time: string;
    content: string;
    immediateActions: Array<{
      title: string;
      description: string;
      icon: 'safety' | 'grounding';
    }>;
    contraindications: Array<{
      title: string;
      description: string;
      icon: 'cognitive' | 'exposure';
    }>;
  };
  onActionClick: (action: any, isContraindication: boolean) => void;
}

const GuidanceTab: React.FC<GuidanceTabProps> = ({ currentGuidance, onActionClick }) => {
  const getActionIcon = (iconType: string) => {
    switch (iconType) {
      case 'safety': return <HealthAndSafety sx={{ fontSize: 20, color: '#128937' }} />;
      case 'grounding': return <NaturePeople sx={{ fontSize: 20, color: '#128937' }} />;
      case 'cognitive': return <Category sx={{ fontSize: 20, color: '#b3261e' }} />;
      case 'exposure': return <Exposure sx={{ fontSize: 20, color: '#b3261e' }} />;
      default: return <HealthAndSafety sx={{ fontSize: 20, color: '#128937' }} />;
    }
  };

  const renderInsightBullets = (content: string) => {
    if (!content) return null;

    const isPlaceholder = content === 'Listening...' || content.startsWith('Start a session') || content.startsWith('Listening for');
    if (isPlaceholder) {
      return (
        <Typography sx={{ fontSize: '16px', color: '#5f6368', fontStyle: 'italic' }}>
          {content}
        </Typography>
      );
    }

    // Parse into bullet points
    let bullets: string[];
    if (content.includes('\n- ') || content.includes('\n• ') || content.startsWith('- ') || content.startsWith('• ')) {
      bullets = content.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l.length > 0);
    } else {
      bullets = content.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 5);
    }

    if (bullets.length <= 1) {
      return (
        <Typography sx={{ fontSize: '16px', lineHeight: '24px', color: '#1f1f1f' }}>
          {content}
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {bullets.map((bullet, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0b57d0', mt: '8px', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '16px', lineHeight: '24px', color: '#1f1f1f' }}>
              {bullet}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const ActionCard = ({ action, isContraindication = false }: {
    action: any;
    isContraindication?: boolean;
  }) => (
    <Paper
      onClick={() => onActionClick(action, isContraindication)}
      sx={{
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #c4c7c5',
        borderRadius: '12px',
        minHeight: '80px',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.75 }}>
        {getActionIcon(action.icon)}
      </Box>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '15px',
          lineHeight: '20px',
          color: '#1f1f1f',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {action.title}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
      pb: 2,
    }}>
      {/* AI Analysis / Insights Box */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: '#e8f0fe',
          border: '1px solid #c0d4f5',
          borderRadius: '12px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Psychology sx={{ fontSize: 18, color: '#0b57d0' }} />
          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0b57d0', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            AI Analysis / Insights
          </Typography>
        </Box>
        {renderInsightBullets(currentGuidance.content)}
      </Paper>

      {/* Action Cards */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Immediate Actions */}
        {currentGuidance.immediateActions.length > 0 && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#128937',
              mb: 1.5,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Immediate Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentGuidance.immediateActions.map((action, index) => (
                <Box key={index} sx={{ flex: 1 }}>
                  <ActionCard action={action} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Contraindications */}
        {currentGuidance.contraindications.length > 0 && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#b3261e',
              mb: 1.5,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Contraindications
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentGuidance.contraindications.map((action, index) => (
                <Box key={index} sx={{ flex: 1 }}>
                  <ActionCard action={action} isContraindication />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GuidanceTab;
