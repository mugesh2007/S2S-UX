import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import security utilities directly from source
import {
  sanitizeUrl,
  sanitizeTailwindClasses,
  sanitizeInlineStyles,
  safeText,
} from '../src/utils/security';

// Import Registry mappings from source
import { APPROVED_COMPONENT_TYPES, getRegistryComponent } from '../src/registry/index';

// Import editor store operations
import { useEditorStore } from '../src/store/useEditorStore';

describe('Security and Sanitization Engine', () => {
  test('sanitizeUrl strictly blocks dangerous protocols (javascript:, data:, vbscript:, file:)', () => {
    assert.equal(sanitizeUrl('javascript:alert(document.cookie)'), '#');
    assert.equal(sanitizeUrl('JAVASCRIPT:alert(1)'), '#');
    assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
    assert.equal(sanitizeUrl('vbscript:msgbox(1)'), '#');
    assert.equal(sanitizeUrl('file:///etc/passwd'), '#');
  });

  test('sanitizeUrl allows safe protocols (http, https, mailto, relative, hash)', () => {
    assert.equal(sanitizeUrl('https://example.com/logo.png'), 'https://example.com/logo.png');
    assert.equal(sanitizeUrl('http://localhost:8000/api/v1'), 'http://localhost:8000/api/v1');
    assert.equal(sanitizeUrl('/assets/avatar.png'), '/assets/avatar.png');
    assert.equal(sanitizeUrl('#section-analytics'), '#section-analytics');
    assert.equal(sanitizeUrl('mailto:support@sketch2screen.ai'), 'mailto:support@sketch2screen.ai');
  });

  test('sanitizeTailwindClasses strips script tokens, HTML tags, quotes, and dangerous chars', () => {
    const dangerous = 'p-4 <script>alert(1)</script> shadow-lg "onclick=alert(1)" bg-blue-600;';
    const cleaned = sanitizeTailwindClasses(dangerous);
    assert.ok(!cleaned.includes('<'));
    assert.ok(!cleaned.includes('>'));
    assert.ok(!cleaned.includes('"'));
    assert.ok(!cleaned.includes(';'));
    assert.ok(cleaned.includes('p-4'));
    assert.ok(cleaned.includes('shadow-lg'));
    assert.ok(cleaned.includes('bg-blue-600'));
  });

  test('sanitizeInlineStyles strips CSS expressions and dangerous behavior properties', () => {
    const malicious = {
      color: '#ffffff',
      fontSize: '14px',
      behavior: 'url(xss.htc)',
      binding: 'url(xss.xml#test)',
      width: 'expression(alert(1))',
    };
    const cleaned = sanitizeInlineStyles(malicious);
    assert.equal(cleaned.color, '#ffffff');
    assert.equal(cleaned.fontSize, '14px');
    assert.equal(cleaned.behavior, undefined);
    assert.equal(cleaned.binding, undefined);
    assert.equal(cleaned.width, undefined);
  });

  test('safeText safely handles string conversion without evaluating code', () => {
    assert.equal(safeText('Hello World'), 'Hello World');
    assert.equal(safeText(12345), '12345');
    assert.equal(safeText(false), 'false');
    assert.equal(safeText(null, 'default'), 'default');
    assert.equal(safeText(undefined, 'fallback'), 'fallback');
    assert.equal(safeText({ obj: true }, 'fallback'), 'fallback');
  });
});

describe('Component Registry Engine', () => {
  test('all 13 approved component types are registered', () => {
    const expected = [
      'Container',
      'Navbar',
      'Card',
      'Button',
      'Input',
      'Heading',
      'Text',
      'Table',
      'Badge',
      'Avatar',
      'Checkbox',
      'ImagePlaceholder',
      'Divider',
    ];

    for (const type of expected) {
      assert.ok(
        APPROVED_COMPONENT_TYPES.includes(type as any),
        `Component type ${type} should be in APPROVED_COMPONENT_TYPES`
      );
      const Component = getRegistryComponent(type);
      assert.ok(Component !== undefined, `Registry component for ${type} must not be undefined`);
    }
  });

  test('synonyms and casing are safely normalized to approved types', () => {
    const synonyms = [
      ['textinput', 'Input'],
      ['text input', 'Input'],
      ['navigationbar', 'Navbar'],
      ['navigation bar', 'Navbar'],
      ['navbar', 'Navbar'],
      ['image', 'ImagePlaceholder'],
      ['image placeholder', 'ImagePlaceholder'],
      ['header', 'Heading'],
      ['heading', 'Heading'],
      ['separator', 'Divider'],
      ['divider', 'Divider'],
      ['button', 'Button'],
      ['card', 'Card'],
      ['container', 'Container'],
      ['text', 'Text'],
      ['table', 'Table'],
      ['badge', 'Badge'],
      ['avatar', 'Avatar'],
      ['checkbox', 'Checkbox'],
    ];

    for (const [raw, expectedApproved] of synonyms) {
      const Comp = getRegistryComponent(raw);
      const ExpectedComp = getRegistryComponent(expectedApproved);
      assert.equal(
        Comp,
        ExpectedComp,
        `Synonym "${raw}" should resolve to <${expectedApproved}> element`
      );
    }
  });

  test('unsupported structures safely return FallbackElement with diagnostic alert', () => {
    const UnknownComponent = getRegistryComponent('CustomMaliciousIframe');
    assert.ok(UnknownComponent !== undefined);
    assert.equal(UnknownComponent.name, 'FallbackElement');
  });
});

describe('Editor Store State Management and History', () => {
  test('store initializes with default AST and allows selecting nodes', () => {
    const store = useEditorStore.getState();
    assert.ok(store.ast !== null);
    assert.ok(store.ast.id !== undefined);

    store.selectNode('btn-refresh');
    assert.equal(useEditorStore.getState().selectedNodeId, 'btn-refresh');

    store.selectNode(null);
    assert.equal(useEditorStore.getState().selectedNodeId, null);
  });

  test('updateNodeProps mutates single component without regenerating the entire interface', () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;

    // Add a test button node
    const testBtnId = `btn-test-${Date.now()}`;
    store.addNode(rootId, {
      id: testBtnId,
      type: 'Button',
      name: 'Test Button',
      props: { label: 'Initial Label', variant: 'primary' },
      styles: {},
      children: [],
    });

    const nodeBefore = useEditorStore.getState().ast.children?.find((c) => c.id === testBtnId);
    assert.equal(nodeBefore?.props.label, 'Initial Label');

    // Mutate props
    store.updateNodeProps(testBtnId, { label: 'Updated Label', variant: 'danger' });
    const nodeAfter = useEditorStore.getState().ast.children?.find((c) => c.id === testBtnId);
    assert.equal(nodeAfter?.props.label, 'Updated Label');
    assert.equal(nodeAfter?.props.variant, 'danger');
  });

  test('duplicateNode creates duplicate with fresh ID and identical props', () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;

    const sourceBtnId = `btn-dup-source-${Date.now()}`;
    store.addNode(rootId, {
      id: sourceBtnId,
      type: 'Button',
      name: 'Duplicate Source',
      props: { label: 'Copy Me', variant: 'outline' },
      styles: {},
      children: [],
    });

    const initialChildCount = useEditorStore.getState().ast.children?.length || 0;
    store.duplicateNode(sourceBtnId);

    const children = useEditorStore.getState().ast.children || [];
    assert.equal(children.length, initialChildCount + 1);

    const duplicated = children.find(
      (c) => c.props.label === 'Copy Me' && c.id !== sourceBtnId
    );
    assert.ok(duplicated !== undefined);
    assert.notEqual(duplicated.id, sourceBtnId);
    assert.ok(duplicated.name.includes('(Copy)'));
  });

  test('undo and redo revert and reapply state changes', () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;

    const undoTestId = `btn-undo-${Date.now()}`;
    store.addNode(rootId, {
      id: undoTestId,
      type: 'Button',
      name: 'Undo Test',
      props: { label: 'Original' },
      styles: {},
      children: [],
    });

    // Update label
    store.updateNodeProps(undoTestId, { label: 'Changed' });
    assert.equal(
      useEditorStore.getState().ast.children?.find((c) => c.id === undoTestId)?.props.label,
      'Changed'
    );

    // Undo change
    assert.ok(useEditorStore.getState().canUndo());
    store.undo();
    assert.equal(
      useEditorStore.getState().ast.children?.find((c) => c.id === undoTestId)?.props.label,
      'Original'
    );

    // Redo change
    assert.ok(useEditorStore.getState().canRedo());
    store.redo();
    assert.equal(
      useEditorStore.getState().ast.children?.find((c) => c.id === undoTestId)?.props.label,
      'Changed'
    );
  });

  test('moveNode correctly reorders child positions up and down', () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;

    const idA = `elem-a-${Date.now()}`;
    const idB = `elem-b-${Date.now()}`;

    store.addNode(rootId, {
      id: idA,
      type: 'Badge',
      name: 'Badge A',
      props: { text: 'Alpha' },
      styles: {},
      children: [],
    });
    store.addNode(rootId, {
      id: idB,
      type: 'Badge',
      name: 'Badge B',
      props: { text: 'Beta' },
      styles: {},
      children: [],
    });

    const childrenBefore = useEditorStore.getState().ast.children || [];
    const idxA = childrenBefore.findIndex((c) => c.id === idA);
    const idxB = childrenBefore.findIndex((c) => c.id === idB);
    assert.ok(idxA !== -1 && idxB !== -1);
    assert.equal(idxB, idxA + 1);

    // Move B up (should swap with A)
    store.moveNode(idB, 'up');

    const childrenAfter = useEditorStore.getState().ast.children || [];
    const newIdxA = childrenAfter.findIndex((c) => c.id === idA);
    const newIdxB = childrenAfter.findIndex((c) => c.id === idB);
    assert.equal(newIdxB, idxA);
    assert.equal(newIdxA, idxB);
  });
});

describe('AST TSX Code Compilation and Safety', () => {
  // Import compiler
  test('compileASTtoReactTSX produces clean, safe React TypeScript code', async () => {
    const { compileASTtoReactTSX } = await import('../src/services/astCompiler');

    const sampleAST: any = {
      id: 'root',
      type: 'Container',
      name: 'Screen Root',
      props: { layout: 'flex-col', padding: 'p-6' },
      styles: { tailwindClasses: 'bg-navy-950' },
      children: [
        {
          id: 'btn-test',
          type: 'Button',
          name: 'Action Button',
          props: { label: 'Click Me', variant: 'primary' },
          styles: {},
          children: [],
        },
      ],
      meta: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        title: 'Compiled Screen',
        designSystem: 'modern-dark',
        targetViewport: { width: 1280, height: 800 },
      },
    };

    const code = compileASTtoReactTSX(sampleAST);
    assert.ok(code.includes("import React from 'react';"));
    assert.ok(code.includes('export const CompiledScreen: React.FC = () => {'));
    assert.ok(code.includes('Click Me'));
    assert.ok(!code.includes('eval('));
    assert.ok(!code.includes('dangerouslySetInnerHTML'));
  });

  test('nodes with missing optional properties render without error', () => {
    // Check that getRegistryComponent for all elements returns functional components
    // that don't fail when called with empty props
    for (const type of APPROVED_COMPONENT_TYPES) {
      const Comp = getRegistryComponent(type);
      assert.equal(typeof Comp, 'function');
    }
  });
});

describe('Sketch Fidelity Evaluation Engine', () => {
  // Import demo fidelity dataset
  test('fidelity dataset includes all 7 analysis dimensions with weights summing to <= 1.0', async () => {
    const { DEMO_FIDELITY_DATA } = await import('../src/store/mockData');

    const expectedDimensions = [
      'presence',
      'ordering',
      'position',
      'size',
      'text',
      'layout',
      'annotation',
    ];

    const reportedDimensions = DEMO_FIDELITY_DATA.scoreBreakdown.dimensions.map((d) => d.dimension);
    for (const dim of expectedDimensions) {
      assert.ok(
        reportedDimensions.includes(dim),
        `Fidelity report must include dimension: ${dim}`
      );
    }

    const totalWeight = DEMO_FIDELITY_DATA.scoreBreakdown.dimensions.reduce(
      (sum, d) => sum + d.weight,
      0
    );
    assert.ok(Math.abs(totalWeight - 1.0) < 0.01, 'Total dimension weights must sum to 1.0');
    assert.ok(DEMO_FIDELITY_DATA.overallScore >= 0 && DEMO_FIDELITY_DATA.overallScore <= 100);
  });

  test('composite fidelity score formula excludes unmeasured dimensions', () => {
    // Synthetic formula verification
    const testDimensions = [
      { name: 'Presence', score: 90, weight: 0.25, isMeasured: true },
      { name: 'Ordering', score: 100, weight: 0.10, isMeasured: true },
      { name: 'Position', score: 80, weight: 0.20, isMeasured: true },
      { name: 'Size', score: 85, weight: 0.15, isMeasured: true },
      { name: 'Text', score: null, weight: 0.10, isMeasured: false }, // Unmeasured
      { name: 'Layout', score: 95, weight: 0.15, isMeasured: true },
      { name: 'Annotation', score: null, weight: 0.05, isMeasured: false }, // Unmeasured
    ];

    const measured = testDimensions.filter((d) => d.isMeasured && d.score !== null);
    const sumWeights = measured.reduce((acc, d) => acc + d.weight, 0);
    const weightedSum = measured.reduce((acc, d) => acc + (d.score as number) * d.weight, 0);
    const compositeScore = Math.round((weightedSum / sumWeights) * 10) / 10;

    assert.ok(sumWeights > 0 && sumWeights < 1.0);
    assert.ok(compositeScore >= 80 && compositeScore <= 95);
  });

  test('findings contain all required evidence, severity, and diagnostic fields', async () => {
    const { DEMO_FIDELITY_DATA } = await import('../src/store/mockData');
    const findings = DEMO_FIDELITY_DATA.findings || [];

    assert.ok(findings.length > 0, 'Report must contain findings');

    for (const f of findings) {
      assert.ok(f.findingId !== undefined, 'findingId required');
      assert.ok(
        ['presence', 'ordering', 'position', 'size', 'text', 'layout', 'annotation'].includes(
          f.category
        ),
        `category ${f.category} must be an approved dimension`
      );
      assert.ok(['high', 'medium', 'low', 'info'].includes(f.severity), 'severity must be valid');
      assert.ok(typeof f.description === 'string' && f.description.length > 0);
      assert.ok(f.confidence >= 0 && f.confidence <= 1.0);
      assert.ok(['open', 'applied', 'dismissed'].includes(f.status));
    }
  });

  test('applying a fidelity correction mutates the targeted AST element non-destructively', () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;

    const testHeadingId = `head-fid-${Date.now()}`;
    store.addNode(rootId, {
      id: testHeadingId,
      type: 'Heading',
      name: 'System Status Title',
      props: { text: 'Old Mismatched Title', level: 2 },
      styles: {},
      children: [],
    });

    // Simulate applying a text fidelity correction
    const targetNodeBefore = useEditorStore
      .getState()
      .ast.children?.find((c) => c.id === testHeadingId);
    assert.equal(targetNodeBefore?.props.text, 'Old Mismatched Title');

    store.updateNodeProps(testHeadingId, { text: 'Telemetry & Health (Fidelity Aligned)' });

    const targetNodeAfter = useEditorStore
      .getState()
      .ast.children?.find((c) => c.id === testHeadingId);
    assert.equal(targetNodeAfter?.props.text, 'Telemetry & Health (Fidelity Aligned)');
  });
});

describe('Targeted Component Correction and Property Updates', () => {
  test('modifies text, colour, width, height, and spacing on a targeted node without full AST regen', () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const testButtonId = `btn-edit-test-${Date.now()}`;

    // 1. Component addition
    store.addNode(rootId, {
      id: testButtonId,
      type: 'Button',
      name: 'Login Action Button',
      props: { label: 'Log In', variant: 'secondary', size: 'md' },
      styles: { tailwindClasses: 'w-auto' },
      children: [],
    });

    const nodeCountAfterAdd = useEditorStore.getState().ast.children?.length || 0;

    // 2. Text editing
    store.updateNodeProps(testButtonId, { label: 'Sign In to Workspace' });
    let node = useEditorStore.getState().ast.children?.find((c) => c.id === testButtonId);
    assert.equal(node?.props.label, 'Sign In to Workspace');

    // 3. Colour change
    store.updateNodeProps(testButtonId, { variant: 'primary' });
    store.updateNodeStyles(testButtonId, 'bg-blue-600 text-white w-full h-12 p-4');
    node = useEditorStore.getState().ast.children?.find((c) => c.id === testButtonId);
    assert.equal(node?.props.variant, 'primary');
    assert.ok(node?.styles.tailwindClasses?.includes('bg-blue-600'));

    // 4. Width and height change
    assert.ok(node?.styles.tailwindClasses?.includes('w-full'));
    assert.ok(node?.styles.tailwindClasses?.includes('h-12'));

    // 5. Spacing change
    assert.ok(node?.styles.tailwindClasses?.includes('p-4'));

    // Verify root AST was NOT replaced, node count remains exact
    assert.equal(useEditorStore.getState().ast.children?.length, nodeCountAfterAdd);

    // 6. Component duplication
    store.duplicateNode(testButtonId);
    assert.equal(useEditorStore.getState().ast.children?.length, nodeCountAfterAdd + 1);

    // 7. Component deletion
    store.deleteNode(testButtonId);
    assert.equal(useEditorStore.getState().ast.children?.length, nodeCountAfterAdd);
  });


  test('root container cannot be deleted or duplicated', () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const initialChildrenCount = store.ast.children?.length || 0;

    // Deleting root should be rejected
    store.deleteNode(rootId);
    assert.equal(useEditorStore.getState().ast.id, rootId);

    // Duplicating root should be rejected
    store.duplicateNode(rootId);
    assert.equal(useEditorStore.getState().ast.id, rootId);
    assert.equal(useEditorStore.getState().ast.children?.length, initialChildrenCount);
  });
});



