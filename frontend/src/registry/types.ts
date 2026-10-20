import React from 'react';
import { S2SNode } from '@/types/ast';

export interface RegistryComponentProps {
  node: S2SNode;
  isSelected?: boolean;
  onSelect?: (nodeId: string) => void;
  isInteractive?: boolean;
  children?: React.ReactNode;
}
