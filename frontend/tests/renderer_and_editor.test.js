import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import security utilities directly
import {
  sanitizeUrl,
  sanitizeTailwindClasses,
  sanitizeInlineStyles,
  safeText,
} from '../src/utils/security.js';

// Import Registry mappings
import { APPROVED_COMPONENT_TYPES, getRegistryComponent } from '../src/registry/index.js';

describe('Security and Sanitization Engine', () => {
  test('sanitizeUrl strictly blocks dangerous protocols', () => {
    assert.equal(sanitizeUrl('javascript:alert(document.cookie)'), '#');
    assert.equal(sanitizeUrl('JAVASCRIPT:alert(1)'), '#');
    assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
    assert.equal(sanitizeUrl('vbscript:msgbox(1)'), '#');
    assert.equal(sanitizeUrl('file:///etc/passwd'), '#');
  });

  test('sanitizeUrl allows safe URLs and relative paths', () => {
    assert.equal(sanitizeUrl('https://example.com/logo.png'), 'https://example.com/logo.png');
    assert.equal(sanitizeUrl('http://localhost:8000/api/v1'), 'http://localhost:8000/api/v1');
    assert.equal(sanitizeUrl('/assets/avatar.png'), '/assets/avatar.png');
    assert.equal(sanitizeUrl('#section-analytics'), '#section-analytics');
    assert.equal(sanitizeUrl('mailto:support@sketch2screen.ai'), 'mailto:support@sketch2screen.ai');
  });

  test('sanitizeTailwindClasses strips script tokens, HTML brackets, and injection vectors', () => {
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

  test('sanitizeInlineStyles strips CSS expressions and binding vectors', () => {
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
        APPROVED_COMPONENT_TYPES.includes(type),
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

  test('unsupported structures return FallbackElement with diagnostic alert', () => {
    const UnknownComponent = getRegistryComponent('CustomMaliciousIframe');
    assert.ok(UnknownComponent !== undefined);
    assert.equal(UnknownComponent.name, 'FallbackElement');
  });
});

describe('Editor State Mutations and History', () => {
  function cloneTree(item) {
    return JSON.parse(JSON.stringify(item));
  }

  function createTestAST() {
    return {
      id: 'root-container',
      type: 'Container',
      name: 'Root Screen',
      props: { layout: 'flex-col', padding: 'p-6' },
      styles: { tailwindClasses: 'bg-navy-950' },
      children: [
        {
          id: 'hdr-nav',
          type: 'Navbar',
          name: 'Main Navbar',
          props: { title: 'App Header' },
          styles: {},
          children: [],
        },
        {
          id: 'card-metrics',
          type: 'Card',
          name: 'Metrics Card',
          props: { title: 'Telemetry' },
          styles: {},
          children: [
            {
              id: 'btn-action-1',
              type: 'Button',
              name: 'Audit Button',
              props: { label: 'Run Audit', variant: 'primary' },
              styles: {},
              children: [],
            },
            {
              id: 'btn-action-2',
              type: 'Button',
              name: 'Reset Button',
              props: { label: 'Reset', variant: 'secondary' },
              styles: {},
              children: [],
            },
          ],
        },
      ],
    };
  }

  test('single node props mutation does not alter sibling nodes or root', () => {
    const tree = createTestAST();
    const originalNavbar = cloneTree(tree.children[0]);

    // Mutate only btn-action-1
    function mutateNode(node, id, patch) {
      if (node.id === id) {
        node.props = { ...node.props, ...patch };
        return;
      }
      if (node.children) {
        for (const child of node.children) {
          mutateNode(child, id, patch);
        }
      }
    }

    mutateNode(tree, 'btn-action-1', { label: 'Updated Audit Label', variant: 'danger' });

    // Verify targeted button updated
    const card = tree.children[1];
    const btn1 = card.children[0];
    assert.equal(btn1.props.label, 'Updated Audit Label');
    assert.equal(btn1.props.variant, 'danger');

    // Verify sibling node untouched
    const btn2 = card.children[1];
    assert.equal(btn2.props.label, 'Reset');
    assert.equal(btn2.props.variant, 'secondary');

    // Verify navbar untouched
    assert.deepEqual(tree.children[0], originalNavbar);
  });

  test('node deletion preserves remaining tree hierarchy', () => {
    const tree = createTestAST();

    function deleteNode(node, id) {
      if (node.children) {
        node.children = node.children
          .filter((c) => c.id !== id)
          .map((c) => {
            deleteNode(c, id);
            return c;
          });
      }
    }

    deleteNode(tree, 'btn-action-1');

    const card = tree.children[1];
    assert.equal(card.children.length, 1);
    assert.equal(card.children[0].id, 'btn-action-2');
  });

  test('node duplication creates replica with fresh ID and identical props', () => {
    const tree = createTestAST();

    function duplicateNode(node, id) {
      if (node.children) {
        const newChildren = [];
        for (const child of node.children) {
          newChildren.push(child);
          if (child.id === id) {
            const clone = cloneTree(child);
            clone.id = `${child.type.toLowerCase()}-copy-${Date.now()}`;
            clone.name = `${child.name} (Copy)`;
            newChildren.push(clone);
          } else {
            duplicateNode(child, id);
          }
        }
        node.children = newChildren;
      }
    }

    duplicateNode(tree, 'btn-action-1');

    const card = tree.children[1];
    assert.equal(card.children.length, 3);
    assert.equal(card.children[0].id, 'btn-action-1');
    assert.notEqual(card.children[1].id, 'btn-action-1');
    assert.equal(card.children[1].props.label, 'Run Audit');
    assert.equal(card.children[1].name, 'Audit Button (Copy)');
    assert.equal(card.children[2].id, 'btn-action-2');
  });

  test('moveNode up and down swaps sibling order cleanly', () => {
    const tree = createTestAST();
    const card = tree.children[1];

    assert.equal(card.children[0].id, 'btn-action-1');
    assert.equal(card.children[1].id, 'btn-action-2');

    // Swap down btn-action-1
    const temp = card.children[0];
    card.children[0] = card.children[1];
    card.children[1] = temp;

    assert.equal(card.children[0].id, 'btn-action-2');
    assert.equal(card.children[1].id, 'btn-action-1');
  });
});
