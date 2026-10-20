import React, { memo } from 'react';
import { S2SNode } from '@/types/ast';
import { getRegistryComponent } from '@/registry';
import { FallbackElement } from '@/registry/elements/FallbackElement';

export interface ASTLiveRendererProps {
  node: S2SNode;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  isInteractive?: boolean;
  currentDepth?: number;
  maxDepth?: number;
}

const MAX_SAFE_DEPTH = 12;

export const ASTLiveRenderer: React.FC<ASTLiveRendererProps> = memo(({
  node,
  selectedNodeId,
  onSelectNode,
  isInteractive = true,
  currentDepth = 1,
  maxDepth = MAX_SAFE_DEPTH,
}) => {
  // Empty / Guard state
  if (!node || typeof node !== 'object') {
    return null;
  }

  // Safety: Prevent stack overflow from circular or excessively deep AST trees
  if (currentDepth > maxDepth) {
    return (
      <div
        className="p-3 rounded-lg border border-red-500/50 bg-red-950/30 text-red-400 text-xs font-mono"
        role="alert"
      >
        <span>Exceeded maximum nesting depth limit ({maxDepth} levels).</span>
      </div>
    );
  }

  // Safe fallback for corrupt or missing node IDs
  const safeNode: S2SNode = {
    ...node,
    id: node.id || `node-auto-${Math.random().toString(36).substring(2, 9)}`,
    props: node.props && typeof node.props === 'object' ? node.props : {},
    styles: node.styles && typeof node.styles === 'object' ? node.styles : {},
    children: Array.isArray(node.children) ? node.children : [],
  };

  const Component = getRegistryComponent(safeNode.type);
  const isSelected = selectedNodeId === safeNode.id;

  // Render children recursively with depth increment
  const renderedChildren =
    safeNode.children && safeNode.children.length > 0
      ? safeNode.children.map((childNode, index) => {
          if (!childNode || typeof childNode !== 'object') return null;
          const childKey = childNode.id || `child-${safeNode.id}-${index}`;
          return (
            <ASTLiveRenderer
              key={childKey}
              node={childNode}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              isInteractive={isInteractive}
              currentDepth={currentDepth + 1}
              maxDepth={maxDepth}
            />
          );
        })
      : undefined;

  return (
    <Component
      node={safeNode}
      isSelected={isSelected}
      onSelect={isInteractive ? onSelectNode : undefined}
      isInteractive={isInteractive}
    >
      {renderedChildren}
    </Component>
  );
});

ASTLiveRenderer.displayName = 'ASTLiveRenderer';
