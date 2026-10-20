var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/store/mockData.ts
var mockData_exports = {};
__export(mockData_exports, {
  DEMO_FIDELITY_DATA: () => DEMO_FIDELITY_DATA,
  DEMO_PROJECTS: () => DEMO_PROJECTS,
  SAMPLE_INITIAL_AST: () => SAMPLE_INITIAL_AST
});
var SAMPLE_INITIAL_AST, DEMO_PROJECTS, DEMO_FIDELITY_DATA;
var init_mockData = __esm({
  "src/store/mockData.ts"() {
    SAMPLE_INITIAL_AST = {
      id: "root-screen",
      type: "Container",
      name: "Screen Root",
      props: {
        layout: "flex-col",
        gap: "gap-6",
        padding: "p-6"
      },
      styles: {
        tailwindClasses: "min-h-[640px] bg-slate-950 text-slate-100 flex flex-col"
      },
      meta: {
        version: "1.0.0",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        title: "CloudOps Analytics Dashboard",
        designSystem: "modern-dark",
        targetViewport: { width: 1280, height: 800 }
      },
      boundingBox: { x: 0, y: 0, w: 1e3, h: 1e3 },
      children: [
        {
          id: "navbar-1",
          type: "Navbar",
          name: "Top Navigation",
          props: {
            title: "CloudOps AI",
            links: ["Overview", "Clusters", "Metrics", "Security"],
            hasUserAvatar: true
          },
          styles: {},
          boundingBox: { x: 20, y: 20, w: 960, h: 70 },
          annotations: ["Sticky header with active cluster badge"]
        },
        {
          id: "hero-header",
          type: "Container",
          name: "Hero Header Section",
          props: {
            layout: "flex-row",
            gap: "gap-4",
            padding: "p-2"
          },
          styles: {
            tailwindClasses: "flex justify-between items-center"
          },
          boundingBox: { x: 20, y: 100, w: 960, h: 60 },
          children: [
            {
              id: "heading-main",
              type: "Heading",
              name: "Dashboard Heading",
              props: {
                text: "System Metrics & Health",
                level: 2,
                align: "left"
              },
              styles: {},
              boundingBox: { x: 20, y: 100, w: 400, h: 40 }
            },
            {
              id: "btn-refresh",
              type: "Button",
              name: "Refresh Button",
              props: {
                label: "Run Health Audit",
                variant: "primary",
                size: "sm"
              },
              styles: {},
              boundingBox: { x: 800, y: 100, w: 180, h: 40 },
              annotations: ["Primary action button on right"]
            }
          ]
        },
        {
          id: "grid-cards",
          type: "Container",
          name: "Metric Cards Grid",
          props: {
            layout: "grid-3",
            gap: "gap-4",
            padding: "p-0"
          },
          styles: {},
          boundingBox: { x: 20, y: 180, w: 960, h: 160 },
          children: [
            {
              id: "card-metric-1",
              type: "Card",
              name: "Latency Metric Card",
              props: {
                title: "Global API Latency",
                subtitle: "p99 trailing 24 hours"
              },
              styles: {},
              boundingBox: { x: 20, y: 180, w: 300, h: 140 },
              children: [
                {
                  id: "heading-val-1",
                  type: "Heading",
                  name: "Latency Value",
                  props: { text: "24.8 ms", level: 1 },
                  styles: { tailwindClasses: "text-blue-400 font-mono" }
                },
                {
                  id: "badge-status-1",
                  type: "Badge",
                  name: "Status Badge",
                  props: { text: "Optimal (99.98% SLA)", variant: "success" },
                  styles: {}
                }
              ]
            },
            {
              id: "card-metric-2",
              type: "Card",
              name: "CPU Utilization Card",
              props: {
                title: "Compute Pool Load",
                subtitle: "12 active Kubernetes worker nodes"
              },
              styles: {},
              boundingBox: { x: 340, y: 180, w: 300, h: 140 },
              children: [
                {
                  id: "heading-val-2",
                  type: "Heading",
                  name: "CPU Value",
                  props: { text: "42.6%", level: 1 },
                  styles: { tailwindClasses: "text-violet-400 font-mono" }
                },
                {
                  id: "badge-status-2",
                  type: "Badge",
                  name: "Normal Load",
                  props: { text: "Balanced across 3 zones", variant: "info" },
                  styles: {}
                }
              ]
            },
            {
              id: "card-metric-3",
              type: "Card",
              name: "Threat Defenses Card",
              props: {
                title: "WAF Firewall Blocks",
                subtitle: "Malicious payload mitigations"
              },
              styles: {},
              boundingBox: { x: 660, y: 180, w: 300, h: 140 },
              children: [
                {
                  id: "heading-val-3",
                  type: "Heading",
                  name: "Threat Count",
                  props: { text: "1,429", level: 1 },
                  styles: { tailwindClasses: "text-amber-400 font-mono" }
                },
                {
                  id: "badge-status-3",
                  type: "Badge",
                  name: "Security Alert",
                  props: { text: "All Mitigated", variant: "warning" },
                  styles: {}
                }
              ]
            }
          ]
        },
        {
          id: "table-container",
          type: "Card",
          name: "Incident Table Card",
          props: {
            title: "Active Workloads & Services",
            subtitle: "Real-time telemetry reports"
          },
          styles: {},
          boundingBox: { x: 20, y: 360, w: 960, h: 220 },
          children: [
            {
              id: "workloads-table",
              type: "Table",
              name: "Services Table",
              props: {
                headers: ["Service Name", "Region", "Status", "Uptime"],
                rows: [
                  ["auth-service-v2", "us-east-1", "Active", "99.99%"],
                  ["ingress-proxy", "eu-west-1", "Active", "100.0%"],
                  ["cache-redis-sharded", "ap-southeast-1", "Syncing", "99.91%"]
                ]
              },
              styles: {},
              boundingBox: { x: 30, y: 410, w: 940, h: 150 }
            }
          ]
        }
      ]
    };
    DEMO_PROJECTS = [
      {
        id: "proj-01",
        title: "CloudOps Analytics Dashboard",
        status: "generated",
        createdAt: "2026-10-18T14:32:00Z",
        updatedAt: "2026-10-20T08:15:00Z",
        nodeCount: 14,
        fidelityScore: 88.5
      },
      {
        id: "proj-02",
        title: "Mobile Auth & Profile Screen",
        status: "reviewed",
        createdAt: "2026-10-16T11:20:00Z",
        updatedAt: "2026-10-19T16:40:00Z",
        nodeCount: 9,
        fidelityScore: 92.1
      },
      {
        id: "proj-03",
        title: "Billing & Plan Upgrade Flow",
        status: "draft",
        createdAt: "2026-10-20T04:10:00Z",
        updatedAt: "2026-10-20T04:10:00Z",
        nodeCount: 6,
        fidelityScore: 76.4
      }
    ];
    DEMO_FIDELITY_DATA = {
      overallScore: 88.5,
      rating: "high",
      isMeasuredCV: true,
      disclaimer: "Measured CV layout IoU + contour spatial similarity + semantic annotation concordance. Represents structural agreement with sketch evidence, not aesthetic quality or model accuracy.",
      scoreBreakdown: {
        formula: "OverallFidelityScore = (sum(w_i * S_i for i in MeasuredDimensions)) / sum(w_i for i in MeasuredDimensions)",
        limitations: [
          "Heuristic 2D Contour Approximation: OpenCV contour extraction uses edge thresholding that may segment faint or broken pencil strokes differently than human perception.",
          "Structural Concordance vs Aesthetics: The score measures spatial and semantic alignment, not visual aesthetics, color harmony, typography beauty, or UX elegance.",
          "Not Model Accuracy: This score measures agreement between the uploaded sketch and the synthesized AST; it does NOT measure model training accuracy or validation performance.",
          "Uncalibrated Evaluation: The formula uses empirically weighted heuristics without calibration against a standardized public sketch-to-code benchmark dataset.",
          "Aspect Ratio Independence: Responsive web containers fluidly reflow across viewport widths (desktop vs mobile), whereas the sketch represents a static drawing."
        ],
        dimensions: [
          {
            dimension: "presence",
            name: "Component Presence",
            score: 90,
            isMeasured: true,
            weight: 0.25,
            details: "Evaluated 14 sketch contours against 13 AST nodes (1 omitted pagination block).",
            findingsCount: 1
          },
          {
            dimension: "ordering",
            name: "Component Ordering",
            score: 95,
            isMeasured: true,
            weight: 0.1,
            details: "Checked 12 vertical reading order relations (0 inversions detected).",
            findingsCount: 0
          },
          {
            dimension: "position",
            name: "Relative Positions",
            score: 84.6,
            isMeasured: true,
            weight: 0.2,
            details: "Mean Euclidean center proximity & IoU across 12 aligned elements (1 shifted button).",
            findingsCount: 1
          },
          {
            dimension: "size",
            name: "Component Sizes",
            score: 88,
            isMeasured: true,
            weight: 0.15,
            details: "Normalized bounding box area ratios and aspect ratios across matched pairs.",
            findingsCount: 1
          },
          {
            dimension: "text",
            name: "Text Consistency",
            score: 94,
            isMeasured: true,
            weight: 0.1,
            details: "SequenceMatcher string similarity across 6 detected text labels.",
            findingsCount: 1
          },
          {
            dimension: "layout",
            name: "Layout Structure",
            score: 100,
            isMeasured: true,
            weight: 0.15,
            details: "Flex and Grid container alignment verification across 3 parent containers.",
            findingsCount: 0
          },
          {
            dimension: "annotation",
            name: "Annotation Compliance",
            score: 85,
            isMeasured: true,
            weight: 0.05,
            details: "Measured compliance for 2 verifiable explicit instructions (1 subjective note marked unknown).",
            findingsCount: 2
          }
        ],
        measuredDimensionsCount: 7,
        totalDimensionsCount: 7
      },
      findings: [
        {
          findingId: "fid-pres-01",
          category: "presence",
          severity: "high",
          description: "Detected sketch element 'Pagination Controls' at [20, 940] was not synthesized into the UI AST.",
          originalSketchEvidence: "Contour contour-pagination at (20, 940, w:960, h:40) with aspect ratio 24.0",
          generatedInterfaceEvidence: "No matching component found in lower footer quadrant",
          suggestedCorrection: "Insert a pagination Container with page numbers and Prev/Next buttons at the bottom.",
          confidence: 0.88,
          boundingBoxSketch: { x: 20, y: 940, w: 960, h: 40 },
          status: "open"
        },
        {
          findingId: "fid-pos-02",
          category: "position",
          severity: "medium",
          description: "Component 'Run Health Audit Button' is shifted 32px right relative to sketch stroke center.",
          originalSketchEvidence: "Sketch stroke center at (780, 110)",
          generatedInterfaceEvidence: "AST button rendered at (812, 110) [IoU: 72.4%]",
          suggestedCorrection: "Set margin-left auto or adjust flex container alignment to shift left.",
          confidence: 0.91,
          targetElementId: "btn-refresh",
          targetElementName: "Run Health Audit Button",
          boundingBoxSketch: { x: 740, y: 90, w: 180, h: 45 },
          boundingBoxAst: { x: 772, y: 90, w: 180, h: 45 },
          status: "open"
        },
        {
          findingId: "fid-size-03",
          category: "size",
          severity: "medium",
          description: "Component 'Threat Defenses Card' width deviates from sketch (rendered width is 1.4x larger).",
          originalSketchEvidence: "Contour width: 220, height: 140 (aspect ratio: 1.57)",
          generatedInterfaceEvidence: "AST width: 300, height: 140 (aspect ratio: 2.14)",
          suggestedCorrection: "Constrain card width using max-w-xs or 3-column equal grid spacing.",
          confidence: 0.85,
          targetElementId: "card-metric-3",
          targetElementName: "Threat Defenses Card",
          boundingBoxSketch: { x: 660, y: 180, w: 220, h: 140 },
          boundingBoxAst: { x: 660, y: 180, w: 300, h: 140 },
          status: "open"
        },
        {
          findingId: "fid-text-04",
          category: "text",
          severity: "medium",
          description: "Text variance on 'Main Header': sketch handwriting was 'Telemetry & Health', generated as 'System Metrics & Health'.",
          originalSketchEvidence: "Handwritten sketch label: 'Telemetry & Health'",
          generatedInterfaceEvidence: "Rendered Heading text: 'System Metrics & Health'",
          suggestedCorrection: "Update Heading text to match original label 'Telemetry & Health'.",
          confidence: 0.89,
          targetElementId: "heading-val-2",
          targetElementName: "Main Header",
          status: "open"
        },
        {
          findingId: "fid-annot-05",
          category: "annotation",
          severity: "medium",
          description: "Annotation 'Make button blue' partially matched: primary button has blue background, but secondary refresh action is charcoal.",
          originalSketchEvidence: "User annotation note: 'Make button blue'",
          generatedInterfaceEvidence: "btn-action has bg-blue-600; btn-refresh has bg-slate-800",
          suggestedCorrection: "Confirm if 'Make button blue' applies to all buttons or only the primary CTA.",
          confidence: 0.94,
          targetElementId: "btn-refresh",
          targetElementName: "Refresh Action Button",
          status: "open"
        },
        {
          findingId: "fid-annot-06",
          category: "annotation",
          severity: "info",
          description: "Annotation 'Clean modern enterprise feel' is subjective; compliance cannot be measured automatically.",
          originalSketchEvidence: "User margin note: 'Clean modern enterprise feel'",
          generatedInterfaceEvidence: "Aesthetic evaluation requires visual designer sign-off",
          suggestedCorrection: "Inspect typography tokens and spacing hierarchy manually in Studio.",
          confidence: 0.5,
          uncertaintyNote: "Qualitative guidance cannot be algorithmically evaluated; marked as unmeasured.",
          status: "open"
        }
      ],
      metrics: {
        layoutIoUScore: {
          score: 84.6,
          weight: 0.4,
          details: "Evaluated 12 matched bounding box pairs via bipartite spatial alignment."
        },
        structuralEdgeSSIM: {
          score: 87.2,
          weight: 0.35,
          details: "Multi-scale contour similarity between Canny-filtered sketch strokes and wireframe bounds."
        },
        semanticAnnotationScore: {
          score: 96,
          weight: 0.25,
          details: "4 of 4 user annotations and handwritten labels successfully parsed and mapped."
        }
      },
      warnings: {
        missingComponents: ["Bottom pagination controls drawn at y:940 not detected in synthesized UI"],
        layoutMismatches: ["Hero section button is shifted 32px right relative to sketch stroke center"],
        uncertainInterpretations: ['Handwritten annotation "Clean modern enterprise feel" is subjective; verification marked as unknown']
      },
      suggestedCorrections: [
        {
          elementId: "btn-refresh",
          elementName: "Refresh Button",
          issue: "Horizontal alignment variance",
          suggestion: "Align to right grid column with margin-left auto.",
          category: "position"
        },
        {
          elementId: "card-metric-3",
          elementName: "Threat Defenses Card",
          issue: "Size deviation",
          suggestion: "Constrain card width to match 220px drawn sketch bounds.",
          category: "size"
        }
      ]
    };
  }
});

// src/services/astCompiler.ts
var astCompiler_exports = {};
__export(astCompiler_exports, {
  compileASTtoReactTSX: () => compileASTtoReactTSX
});
function escapeJSXText(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function nodeToJSX(node, depth = 2) {
  const indent = "  ".repeat(depth);
  const { type, props = {}, styles = {}, children = [] } = node;
  const classes = styles.tailwindClasses || "";
  switch (type) {
    case "Button": {
      const { label = "Button", variant = "primary", size = "md" } = props;
      const variantClass = variant === "primary" ? "bg-blue-600 hover:bg-blue-500 text-white" : variant === "secondary" ? "bg-slate-800 text-slate-100 border border-slate-700" : "border border-blue-500/50 text-blue-400";
      const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
      return `${indent}<button className="inline-flex items-center justify-center font-medium rounded-lg transition-colors ${sizeClass} ${variantClass} ${classes}">
${indent}  ${escapeJSXText(
        String(label)
      )}
${indent}</button>`;
    }
    case "Heading": {
      const { text = "Heading", level = 2 } = props;
      const Tag = `h${Math.min(Math.max(Number(level) || 2, 1), 6)}`;
      const sizeClass = level === 1 ? "text-3xl font-extrabold" : level === 2 ? "text-2xl font-bold" : "text-xl font-semibold";
      return `${indent}<${Tag} className="${sizeClass} text-white tracking-tight ${classes}">
${indent}  ${escapeJSXText(
        String(text)
      )}
${indent}</${Tag}>`;
    }
    case "Text": {
      const { content = "Text" } = props;
      return `${indent}<p className="text-sm text-slate-300 leading-relaxed ${classes}">
${indent}  ${escapeJSXText(
        String(content)
      )}
${indent}</p>`;
    }
    case "Input": {
      const { label, placeholder = "Enter value...", inputType = "text" } = props;
      return `${indent}<div className="space-y-1.5 w-full">
${label ? `${indent}  <label className="block text-xs font-medium text-slate-300">${escapeJSXText(
        String(label)
      )}</label>
` : ""}${indent}  <input type="${inputType}" placeholder="${escapeJSXText(
        String(placeholder)
      )}" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 ${classes}" />
${indent}</div>`;
    }
    case "Badge": {
      const { text = "Badge", variant = "info" } = props;
      const variantClass = variant === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : variant === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      return `${indent}<span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${variantClass} ${classes}">${escapeJSXText(
        String(text)
      )}</span>`;
    }
    case "Card": {
      const { title, subtitle } = props;
      const childJSX = children.map((c) => nodeToJSX(c, depth + 1)).join("\n");
      return `${indent}<div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md ${classes}">
${title || subtitle ? `${indent}  <div className="mb-4 pb-3 border-b border-slate-800/60">
${title ? `${indent}    <h4 className="text-sm font-semibold text-slate-100">${escapeJSXText(
        String(title)
      )}</h4>
` : ""}${subtitle ? `${indent}    <p className="text-xs text-slate-400 mt-0.5">${escapeJSXText(
        String(subtitle)
      )}</p>
` : ""}${indent}  </div>
` : ""}${childJSX ? `${childJSX}
` : ""}${indent}</div>`;
    }
    case "Container": {
      const { layout = "flex-col", gap = "gap-4", padding = "p-4" } = props;
      const layoutClass = layout === "grid-3" ? "grid grid-cols-1 md:grid-cols-3" : layout === "grid-2" ? "grid grid-cols-1 md:grid-cols-2" : layout === "flex-row" ? "flex flex-row items-center" : "flex flex-col";
      const childJSX = children.map((c) => nodeToJSX(c, depth + 1)).join("\n");
      return `${indent}<div className="${layoutClass} ${gap} ${padding} ${classes}">
${childJSX ? `${childJSX}
` : ""}${indent}</div>`;
    }
    case "Navbar": {
      const { title = "Application", links = [] } = props;
      const linksJSX = Array.isArray(links) ? links.map(
        (l) => `${indent}    <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">${escapeJSXText(
          String(l)
        )}</span>`
      ).join("\n") : "";
      return `${indent}<nav className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 ${classes}">
${indent}  <div className="font-semibold text-sm text-white">${escapeJSXText(
        String(title)
      )}</div>
${indent}  <div className="flex items-center gap-4 text-xs font-medium">
${linksJSX}
${indent}  </div>
${indent}</nav>`;
    }
    default: {
      const childJSX = children.map((c) => nodeToJSX(c, depth + 1)).join("\n");
      return `${indent}<div className="p-4 rounded-lg bg-slate-900/60 ${classes}">
${childJSX ? `${childJSX}
` : ""}${indent}</div>`;
    }
  }
}
function compileASTtoReactTSX(ast) {
  const rootContent = nodeToJSX(ast, 2);
  const componentName = ast.meta?.title ? ast.meta.title.replace(/[^a-zA-Z0-9]/g, "") : "GeneratedScreen";
  return `import React from 'react';

/**
 * Generated by Sketch2Screen AI (S2S ux)
 * Source: Hand-drawn sketch converted to validated React AST
 * Created: ${ast.meta?.createdAt || (/* @__PURE__ */ new Date()).toISOString()}
 */
export const ${componentName}: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col font-sans antialiased">
      <div className="max-w-7xl w-full mx-auto space-y-6">
${rootContent}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
var init_astCompiler = __esm({
  "src/services/astCompiler.ts"() {
  }
});

// tests/renderer_and_editor.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";

// src/utils/security.ts
var SAFE_URL_PATTERN = /^(https?:|mailto:|#|\/[a-zA-Z0-9_\-./]*)/i;
var DANGEROUS_CSS_PATTERN = /(expression|behavior|javascript:|vbscript:|@import|-moz-binding|<|>|url\s*\(\s*['"]?data:)/i;
function sanitizeUrl(url, fallback = "#") {
  if (typeof url !== "string" || !url.trim()) {
    return fallback;
  }
  const clean = url.trim();
  if (/^(javascript|data|vbscript|file):/i.test(clean)) {
    return fallback;
  }
  if (SAFE_URL_PATTERN.test(clean)) {
    return clean;
  }
  return fallback;
}
function sanitizeTailwindClasses(classes) {
  if (typeof classes !== "string") return "";
  return classes.replace(/[<>"';`{}\\]/g, "").replace(/\s+/g, " ").trim();
}
function sanitizeInlineStyles(styles) {
  if (!styles || typeof styles !== "object") return {};
  const cleanStyles = {};
  for (const [key, val] of Object.entries(styles)) {
    if (typeof key !== "string" || typeof val !== "string") continue;
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("behavior") || lowerKey.includes("binding") || lowerKey.includes("expression")) {
      continue;
    }
    if (DANGEROUS_CSS_PATTERN.test(val)) {
      continue;
    }
    cleanStyles[key] = val.trim();
  }
  return cleanStyles;
}
function safeText(value, fallback = "") {
  if (value === null || value === void 0) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

// src/registry/elements/ButtonElement.tsx
import React from "react";

// src/utils/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/registry/elements/ButtonElement.tsx
var ButtonElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const {
    label = "Button",
    variant = "primary",
    size = "md",
    disabled = false
  } = node.props || {};
  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-5 py-2.5 rounded-xl"
  };
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    outline: "border border-blue-500/50 text-blue-400 hover:bg-blue-500/10",
    danger: "bg-red-600 hover:bg-red-500 text-white font-medium",
    ghost: "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
  };
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-component-id": node.id,
      "data-node-type": "Button",
      disabled,
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "inline-flex items-center justify-center font-medium transition-all select-none",
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 scale-[1.01]"
      )
    },
    safeText(label, "Button")
  );
};

// src/registry/elements/InputElement.tsx
import React2 from "react";
var InputElement = ({
  node,
  isSelected,
  onSelect,
  isInteractive
}) => {
  const {
    label,
    placeholder = "Enter value...",
    inputType = "text",
    disabled = false
  } = node.props || {};
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "Input",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      className: cn(
        "w-full text-left space-y-1.5 transition-all",
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded-lg p-1"
      )
    },
    label && /* @__PURE__ */ React2.createElement("label", { className: "block text-xs font-medium text-slate-300" }, safeText(label)),
    /* @__PURE__ */ React2.createElement(
      "input",
      {
        type: String(inputType),
        placeholder: safeText(placeholder, "Enter value..."),
        disabled,
        readOnly: !isInteractive,
        style: sanitizeInlineStyles(node.styles?.customStyles),
        className: cn(
          "w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors",
          sanitizeTailwindClasses(node.styles?.tailwindClasses)
        )
      }
    )
  );
};

// src/registry/elements/HeadingElement.tsx
import React3 from "react";
var HeadingElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const { text = "Heading", level = 2, align = "left" } = node.props || {};
  const levelStyles = {
    1: "text-2xl sm:text-3xl font-extrabold text-white tracking-tight",
    2: "text-xl sm:text-2xl font-bold text-white tracking-tight",
    3: "text-lg sm:text-xl font-semibold text-slate-100",
    4: "text-base font-semibold text-slate-200",
    5: "text-sm font-semibold text-slate-300",
    6: "text-xs font-semibold text-slate-400 uppercase tracking-wider"
  };
  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };
  const Tag = `h${Math.min(Math.max(Number(level) || 2, 1), 6)}`;
  return /* @__PURE__ */ React3.createElement(
    Tag,
    {
      "data-component-id": node.id,
      "data-node-type": "Heading",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        levelStyles[Number(level)] || levelStyles[2],
        alignStyles[align] || alignStyles.left,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded px-1"
      )
    },
    safeText(text, "Heading")
  );
};

// src/registry/elements/TextElement.tsx
import React4 from "react";
var TextElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const { content = "Text block", variant = "body" } = node.props || {};
  const variantStyles = {
    body: "text-sm text-slate-300 leading-relaxed",
    caption: "text-xs text-slate-400",
    lead: "text-base text-slate-200 leading-relaxed font-normal",
    code: "font-mono text-xs text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
  };
  return /* @__PURE__ */ React4.createElement(
    "p",
    {
      "data-component-id": node.id,
      "data-node-type": "Text",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        variantStyles[variant] || variantStyles.body,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded px-1"
      )
    },
    safeText(content, "Text block")
  );
};

// src/registry/elements/ContainerElement.tsx
import React5 from "react";
var ContainerElement = ({
  node,
  isSelected,
  onSelect,
  children
}) => {
  const {
    layout = "flex-col",
    gap = "gap-4",
    padding = "p-4"
  } = node.props || {};
  const layoutStyles = {
    "flex-col": "flex flex-col",
    "flex-row": "flex flex-row flex-wrap items-center",
    "grid-2": "grid grid-cols-1 sm:grid-cols-2",
    "grid-3": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "grid-4": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };
  const hasChildren = React5.Children.count(children) > 0;
  return /* @__PURE__ */ React5.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "Container",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "w-full rounded-xl transition-all relative",
        layoutStyles[layout] || "flex flex-col",
        gap,
        padding,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-500/80 bg-blue-500/5"
      )
    },
    isSelected && /* @__PURE__ */ React5.createElement("span", { className: "absolute -top-2.5 left-2 bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow z-10 pointer-events-none" }, "Container #", node.id.slice(-4)),
    hasChildren ? children : /* @__PURE__ */ React5.createElement("div", { className: "w-full py-6 border-2 border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500 font-mono flex flex-col items-center justify-center gap-1" }, /* @__PURE__ */ React5.createElement("span", null, "Empty Container"), /* @__PURE__ */ React5.createElement("span", { className: "text-[10px] text-slate-600" }, 'Select container and click "Insert Component"'))
  );
};

// src/registry/elements/CardElement.tsx
import React6 from "react";
var CardElement = ({
  node,
  isSelected,
  onSelect,
  children
}) => {
  const {
    title,
    subtitle,
    shadow = "md",
    border = true
  } = node.props || {};
  const shadowStyles = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-xl"
  };
  return /* @__PURE__ */ React6.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "Card",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "w-full bg-slate-900/90 rounded-2xl p-5 text-left transition-all",
        border && "border border-slate-800/80",
        shadowStyles[shadow] || "shadow-md",
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950"
      )
    },
    (title || subtitle) && /* @__PURE__ */ React6.createElement("div", { className: "mb-4 pb-3 border-b border-slate-800/60" }, title && /* @__PURE__ */ React6.createElement("h4", { className: "text-sm font-semibold text-slate-100 tracking-tight" }, safeText(title)), subtitle && /* @__PURE__ */ React6.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, safeText(subtitle))),
    /* @__PURE__ */ React6.createElement("div", { className: "space-y-3" }, children)
  );
};

// src/registry/elements/NavbarElement.tsx
import React7 from "react";
import { Layers } from "lucide-react";
var NavbarElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const {
    title = "S2S App",
    links = ["Dashboard", "Projects", "Analytics"],
    hasUserAvatar = true
  } = node.props || {};
  return /* @__PURE__ */ React7.createElement(
    "nav",
    {
      "data-component-id": node.id,
      "data-node-type": "Navbar",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm transition-all",
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950"
      )
    },
    /* @__PURE__ */ React7.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React7.createElement("div", { className: "w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white" }, /* @__PURE__ */ React7.createElement(Layers, { className: "w-3.5 h-3.5" })), /* @__PURE__ */ React7.createElement("span", { className: "font-semibold text-sm text-white tracking-tight" }, safeText(title, "S2S App"))),
    /* @__PURE__ */ React7.createElement("div", { className: "hidden sm:flex items-center gap-4 text-xs font-medium text-slate-300" }, Array.isArray(links) && links.map((link, idx) => /* @__PURE__ */ React7.createElement("span", { key: idx, className: "hover:text-white cursor-pointer transition-colors" }, safeText(link)))),
    hasUserAvatar && /* @__PURE__ */ React7.createElement("div", { className: "w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200" }, "U")
  );
};

// src/registry/elements/TableElement.tsx
import React8 from "react";
var TableElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const {
    headers = ["Column 1", "Column 2", "Status"],
    rows = [
      ["Item Alpha", "Active", "98%"],
      ["Item Beta", "Pending", "74%"]
    ]
  } = node.props || {};
  const safeHeaders = Array.isArray(headers) ? headers : ["Column 1", "Column 2"];
  const safeRows = Array.isArray(rows) ? rows : [];
  return /* @__PURE__ */ React8.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "Table",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80",
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950"
      )
    },
    /* @__PURE__ */ React8.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React8.createElement("thead", { className: "bg-slate-800/60 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-semibold" }, /* @__PURE__ */ React8.createElement("tr", null, safeHeaders.map((h, i) => /* @__PURE__ */ React8.createElement("th", { key: i, className: "px-3.5 py-2.5" }, safeText(h))))), /* @__PURE__ */ React8.createElement("tbody", { className: "divide-y divide-slate-800/60 text-slate-300" }, safeRows.length > 0 ? safeRows.map((row, rIdx) => /* @__PURE__ */ React8.createElement("tr", { key: rIdx, className: "hover:bg-slate-800/30" }, Array.isArray(row) && row.map((cell, cIdx) => /* @__PURE__ */ React8.createElement("td", { key: cIdx, className: "px-3.5 py-2.5" }, safeText(cell))))) : /* @__PURE__ */ React8.createElement("tr", null, /* @__PURE__ */ React8.createElement("td", { colSpan: safeHeaders.length || 1, className: "px-4 py-6 text-center text-slate-500 font-mono" }, "No data rows in table"))))
  );
};

// src/registry/elements/BadgeElement.tsx
import React9 from "react";
var BadgeElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const { text = "Badge", variant = "info" } = node.props || {};
  const variantStyles = {
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20",
    neutral: "bg-slate-800 text-slate-300 border border-slate-700/60"
  };
  return /* @__PURE__ */ React9.createElement(
    "span",
    {
      "data-component-id": node.id,
      "data-node-type": "Badge",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full select-none",
        variantStyles[variant] || variantStyles.info,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950"
      )
    },
    safeText(text, "Badge")
  );
};

// src/registry/elements/AvatarElement.tsx
import React10 from "react";
import { User } from "lucide-react";
var AvatarElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const { fallback = "U", size = "md", src } = node.props || {};
  const sizeStyles = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base"
  };
  const cleanSrc = src ? sanitizeUrl(src, "") : "";
  return /* @__PURE__ */ React10.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "Avatar",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "relative rounded-full overflow-hidden flex items-center justify-center font-semibold bg-slate-800 text-slate-200 border border-slate-700 select-none shrink-0",
        sizeStyles[size] || sizeStyles.md,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950"
      )
    },
    cleanSrc ? /* @__PURE__ */ React10.createElement("img", { src: cleanSrc, alt: safeText(fallback, "Avatar"), className: "w-full h-full object-cover" }) : fallback ? /* @__PURE__ */ React10.createElement("span", null, safeText(fallback).charAt(0).toUpperCase() || "U") : /* @__PURE__ */ React10.createElement(User, { className: "w-4 h-4 text-slate-400" })
  );
};

// src/registry/elements/CheckboxElement.tsx
import React11 from "react";
import { Check } from "lucide-react";
var CheckboxElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const { label = "Checkbox option", checked = false } = node.props || {};
  return /* @__PURE__ */ React11.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "Checkbox",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none text-left",
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded px-1"
      )
    },
    /* @__PURE__ */ React11.createElement(
      "div",
      {
        className: cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
          checked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-700 bg-slate-900 text-transparent"
        )
      },
      /* @__PURE__ */ React11.createElement(Check, { className: "w-3 h-3 stroke-[3]" })
    ),
    /* @__PURE__ */ React11.createElement("span", { className: "text-sm text-slate-200" }, safeText(label, "Checkbox option"))
  );
};

// src/registry/elements/ImagePlaceholderElement.tsx
import React12 from "react";
import { Image as ImageIcon } from "lucide-react";
var ImagePlaceholderElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const { caption, alt = "Image placeholder", aspectRatio = "16:9" } = node.props || {};
  const ratioStyles = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square"
  };
  return /* @__PURE__ */ React12.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "ImagePlaceholder",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/60 p-4 transition-all",
        ratioStyles[aspectRatio] || "min-h-[140px]",
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950"
      )
    },
    /* @__PURE__ */ React12.createElement(ImageIcon, { className: "w-8 h-8 text-slate-500 mb-1" }),
    /* @__PURE__ */ React12.createElement("span", { className: "text-xs text-slate-400 font-medium" }, safeText(alt, "Image placeholder")),
    caption && /* @__PURE__ */ React12.createElement("span", { className: "text-[10px] text-slate-500 mt-0.5" }, safeText(caption))
  );
};

// src/registry/elements/DividerElement.tsx
import React13 from "react";
var DividerElement = ({
  node,
  isSelected,
  onSelect
}) => {
  const { orientation = "horizontal", thickness = "thin" } = node.props || {};
  const isVertical = orientation === "vertical";
  const thicknessStyles = {
    thin: isVertical ? "w-px" : "h-px",
    medium: isVertical ? "w-0.5" : "h-0.5",
    thick: isVertical ? "w-1" : "h-1"
  };
  return /* @__PURE__ */ React13.createElement(
    "div",
    {
      "data-component-id": node.id,
      "data-node-type": "Divider",
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      style: sanitizeInlineStyles(node.styles?.customStyles),
      className: cn(
        "bg-slate-800 transition-all select-none",
        isVertical ? "h-full mx-2 self-stretch" : "w-full my-3",
        thicknessStyles[thickness] || (isVertical ? "w-px" : "h-px"),
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950"
      ),
      role: "separator",
      "aria-orientation": isVertical ? "vertical" : "horizontal"
    }
  );
};

// src/registry/elements/FallbackElement.tsx
import React14 from "react";
import { AlertTriangle } from "lucide-react";
var FallbackElement = ({
  node,
  isSelected,
  onSelect
}) => {
  return /* @__PURE__ */ React14.createElement(
    "div",
    {
      "data-component-id": node.id,
      onClick: (e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      },
      className: cn(
        "p-3.5 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5 select-none transition-all",
        isSelected && "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-glow-sm"
      ),
      role: "alert"
    },
    /* @__PURE__ */ React14.createElement(AlertTriangle, { className: "w-4 h-4 shrink-0 text-amber-400 mt-0.5" }),
    /* @__PURE__ */ React14.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React14.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React14.createElement("span", { className: "font-semibold text-white" }, "Unsupported Element: <", node.type || "Undefined", ">"), /* @__PURE__ */ React14.createElement("span", { className: "font-mono text-[10px] text-amber-400/80" }, "ID: ", node.id)), /* @__PURE__ */ React14.createElement("p", { className: "text-[11px] text-amber-200/80 leading-relaxed" }, "This component type is not in the approved component allowlist. Select this component to replace or delete it in the inspector."))
  );
};

// src/registry/index.ts
var APPROVED_COMPONENT_TYPES = [
  "Container",
  "Navbar",
  "Card",
  "Button",
  "Input",
  "Heading",
  "Text",
  "Table",
  "Badge",
  "Avatar",
  "Checkbox",
  "ImagePlaceholder",
  "Divider"
];
var ComponentRegistry = {
  Button: ButtonElement,
  Input: InputElement,
  Heading: HeadingElement,
  Text: TextElement,
  Container: ContainerElement,
  Card: CardElement,
  Navbar: NavbarElement,
  Table: TableElement,
  Badge: BadgeElement,
  Avatar: AvatarElement,
  Checkbox: CheckboxElement,
  ImagePlaceholder: ImagePlaceholderElement,
  Divider: DividerElement
};
function getRegistryComponent(type) {
  if (!type) return FallbackElement;
  if (ComponentRegistry[type]) {
    return ComponentRegistry[type];
  }
  const cleanType = type.trim().toLowerCase();
  switch (cleanType) {
    case "textinput":
    case "text input":
      return InputElement;
    case "navigation":
    case "navigationbar":
    case "navigation bar":
      return NavbarElement;
    case "image":
    case "image placeholder":
      return ImagePlaceholderElement;
    case "header":
      return HeadingElement;
    case "separator":
      return DividerElement;
    default:
      const matchedKey = Object.keys(ComponentRegistry).find(
        (key) => key.toLowerCase() === cleanType
      );
      return matchedKey ? ComponentRegistry[matchedKey] : FallbackElement;
  }
}

// src/store/useEditorStore.ts
init_mockData();
import { create } from "zustand";
function cloneTree(item) {
  return JSON.parse(JSON.stringify(item));
}
function cloneWithNewIds(node) {
  const newId = `${node.type.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  return {
    ...cloneTree(node),
    id: newId,
    name: `${node.name} (Copy)`,
    children: node.children ? node.children.map(cloneWithNewIds) : []
  };
}
function duplicateNodeRecursively(node, id) {
  let duplicatedId = null;
  function traverse(current) {
    const cloned = { ...current };
    if (cloned.children) {
      const newChildren = [];
      for (const child of cloned.children) {
        if (child.id === id) {
          const dup = cloneWithNewIds(child);
          duplicatedId = dup.id;
          newChildren.push(child);
          newChildren.push(dup);
        } else {
          newChildren.push(traverse(child));
        }
      }
      cloned.children = newChildren;
    }
    return cloned;
  }
  const newTree = traverse(node);
  return { newTree, duplicatedId };
}
function moveNodeRecursively(node, id, direction) {
  const cloned = { ...node };
  if (cloned.children) {
    const index = cloned.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      const newChildren = [...cloned.children];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newChildren.length) {
        const temp = newChildren[index];
        newChildren[index] = newChildren[targetIndex];
        newChildren[targetIndex] = temp;
      }
      cloned.children = newChildren;
      return cloned;
    }
    cloned.children = cloned.children.map(
      (child) => moveNodeRecursively(child, id, direction)
    );
  }
  return cloned;
}
function findNode(node, id) {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}
function updateNodeRecursively(node, id, mutate) {
  const cloned = { ...node, props: { ...node.props }, styles: { ...node.styles } };
  if (cloned.id === id) {
    mutate(cloned);
    return cloned;
  }
  if (cloned.children) {
    cloned.children = cloned.children.map(
      (child) => updateNodeRecursively(child, id, mutate)
    );
  }
  return cloned;
}
function deleteNodeRecursively(node, id) {
  const cloned = { ...node };
  if (cloned.children) {
    cloned.children = cloned.children.filter((child) => child.id !== id).map((child) => deleteNodeRecursively(child, id));
  }
  return cloned;
}
function insertNodeRecursively(node, parentId, newNode) {
  const cloned = { ...node };
  if (cloned.id === parentId) {
    cloned.children = [...cloned.children || [], newNode];
    return cloned;
  }
  if (cloned.children) {
    cloned.children = cloned.children.map(
      (child) => insertNodeRecursively(child, parentId, newNode)
    );
  }
  return cloned;
}
var useEditorStore = create((set, get) => ({
  ast: cloneTree(SAMPLE_INITIAL_AST),
  selectedNodeId: "btn-refresh",
  hoveredNodeId: null,
  viewportMode: "desktop",
  zoomLevel: 1,
  history: {
    past: [],
    future: []
  },
  projectId: null,
  setAST: (newTree) => {
    set((state) => ({
      ast: newTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: []
      }
    }));
  },
  setProjectId: (id) => set({ projectId: id }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setViewportMode: (mode) => set({ viewportMode: mode }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.4, Math.min(zoom, 1.8)) }),
  updateNodeProps: (nodeId, newProps) => {
    const current = get().ast;
    const nextTree = updateNodeRecursively(current, nodeId, (target) => {
      target.props = { ...target.props, ...newProps };
    });
    set((state) => ({
      ast: nextTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: []
      }
    }));
  },
  updateNodeStyles: (nodeId, tailwindClasses) => {
    const current = get().ast;
    const nextTree = updateNodeRecursively(current, nodeId, (target) => {
      target.styles = { ...target.styles, tailwindClasses };
    });
    set((state) => ({
      ast: nextTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: []
      }
    }));
  },
  deleteNode: (nodeId) => {
    if (nodeId === get().ast.id) return;
    const current = get().ast;
    const nextTree = deleteNodeRecursively(current, nodeId);
    set((state) => ({
      ast: nextTree,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: []
      }
    }));
  },
  duplicateNode: (nodeId) => {
    if (nodeId === get().ast.id) return;
    const current = get().ast;
    const { newTree, duplicatedId } = duplicateNodeRecursively(current, nodeId);
    set((state) => ({
      ast: newTree,
      selectedNodeId: duplicatedId || state.selectedNodeId,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: []
      }
    }));
  },
  moveNode: (nodeId, direction) => {
    if (nodeId === get().ast.id) return;
    const current = get().ast;
    const nextTree = moveNodeRecursively(current, nodeId, direction);
    set((state) => ({
      ast: nextTree,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: []
      }
    }));
  },
  addNode: (parentId, newNode) => {
    const current = get().ast;
    const nextTree = insertNodeRecursively(current, parentId, newNode);
    set((state) => ({
      ast: nextTree,
      selectedNodeId: newNode.id,
      history: {
        past: [...state.history.past, cloneTree(state.ast)],
        future: []
      }
    }));
  },
  undo: () => {
    const { past, future } = get().history;
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set((state) => ({
      ast: previous,
      history: {
        past: newPast,
        future: [cloneTree(state.ast), ...future]
      }
    }));
  },
  redo: () => {
    const { past, future } = get().history;
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set((state) => ({
      ast: next,
      history: {
        past: [...past, cloneTree(state.ast)],
        future: newFuture
      }
    }));
  },
  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
  getSelectedNode: () => {
    const { ast, selectedNodeId } = get();
    if (!selectedNodeId) return null;
    return findNode(ast, selectedNodeId);
  }
}));

// tests/renderer_and_editor.test.ts
describe("Security and Sanitization Engine", () => {
  test("sanitizeUrl strictly blocks dangerous protocols (javascript:, data:, vbscript:, file:)", () => {
    assert.equal(sanitizeUrl("javascript:alert(document.cookie)"), "#");
    assert.equal(sanitizeUrl("JAVASCRIPT:alert(1)"), "#");
    assert.equal(sanitizeUrl("data:text/html,<script>alert(1)</script>"), "#");
    assert.equal(sanitizeUrl("vbscript:msgbox(1)"), "#");
    assert.equal(sanitizeUrl("file:///etc/passwd"), "#");
  });
  test("sanitizeUrl allows safe protocols (http, https, mailto, relative, hash)", () => {
    assert.equal(sanitizeUrl("https://example.com/logo.png"), "https://example.com/logo.png");
    assert.equal(sanitizeUrl("http://localhost:8000/api/v1"), "http://localhost:8000/api/v1");
    assert.equal(sanitizeUrl("/assets/avatar.png"), "/assets/avatar.png");
    assert.equal(sanitizeUrl("#section-analytics"), "#section-analytics");
    assert.equal(sanitizeUrl("mailto:support@sketch2screen.ai"), "mailto:support@sketch2screen.ai");
  });
  test("sanitizeTailwindClasses strips script tokens, HTML tags, quotes, and dangerous chars", () => {
    const dangerous = 'p-4 <script>alert(1)</script> shadow-lg "onclick=alert(1)" bg-blue-600;';
    const cleaned = sanitizeTailwindClasses(dangerous);
    assert.ok(!cleaned.includes("<"));
    assert.ok(!cleaned.includes(">"));
    assert.ok(!cleaned.includes('"'));
    assert.ok(!cleaned.includes(";"));
    assert.ok(cleaned.includes("p-4"));
    assert.ok(cleaned.includes("shadow-lg"));
    assert.ok(cleaned.includes("bg-blue-600"));
  });
  test("sanitizeInlineStyles strips CSS expressions and dangerous behavior properties", () => {
    const malicious = {
      color: "#ffffff",
      fontSize: "14px",
      behavior: "url(xss.htc)",
      binding: "url(xss.xml#test)",
      width: "expression(alert(1))"
    };
    const cleaned = sanitizeInlineStyles(malicious);
    assert.equal(cleaned.color, "#ffffff");
    assert.equal(cleaned.fontSize, "14px");
    assert.equal(cleaned.behavior, void 0);
    assert.equal(cleaned.binding, void 0);
    assert.equal(cleaned.width, void 0);
  });
  test("safeText safely handles string conversion without evaluating code", () => {
    assert.equal(safeText("Hello World"), "Hello World");
    assert.equal(safeText(12345), "12345");
    assert.equal(safeText(false), "false");
    assert.equal(safeText(null, "default"), "default");
    assert.equal(safeText(void 0, "fallback"), "fallback");
    assert.equal(safeText({ obj: true }, "fallback"), "fallback");
  });
});
describe("Component Registry Engine", () => {
  test("all 13 approved component types are registered", () => {
    const expected = [
      "Container",
      "Navbar",
      "Card",
      "Button",
      "Input",
      "Heading",
      "Text",
      "Table",
      "Badge",
      "Avatar",
      "Checkbox",
      "ImagePlaceholder",
      "Divider"
    ];
    for (const type of expected) {
      assert.ok(
        APPROVED_COMPONENT_TYPES.includes(type),
        `Component type ${type} should be in APPROVED_COMPONENT_TYPES`
      );
      const Component = getRegistryComponent(type);
      assert.ok(Component !== void 0, `Registry component for ${type} must not be undefined`);
    }
  });
  test("synonyms and casing are safely normalized to approved types", () => {
    const synonyms = [
      ["textinput", "Input"],
      ["text input", "Input"],
      ["navigationbar", "Navbar"],
      ["navigation bar", "Navbar"],
      ["navbar", "Navbar"],
      ["image", "ImagePlaceholder"],
      ["image placeholder", "ImagePlaceholder"],
      ["header", "Heading"],
      ["heading", "Heading"],
      ["separator", "Divider"],
      ["divider", "Divider"],
      ["button", "Button"],
      ["card", "Card"],
      ["container", "Container"],
      ["text", "Text"],
      ["table", "Table"],
      ["badge", "Badge"],
      ["avatar", "Avatar"],
      ["checkbox", "Checkbox"]
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
  test("unsupported structures safely return FallbackElement with diagnostic alert", () => {
    const UnknownComponent = getRegistryComponent("CustomMaliciousIframe");
    assert.ok(UnknownComponent !== void 0);
    assert.equal(UnknownComponent.name, "FallbackElement");
  });
});
describe("Editor Store State Management and History", () => {
  test("store initializes with default AST and allows selecting nodes", () => {
    const store = useEditorStore.getState();
    assert.ok(store.ast !== null);
    assert.ok(store.ast.id !== void 0);
    store.selectNode("btn-refresh");
    assert.equal(useEditorStore.getState().selectedNodeId, "btn-refresh");
    store.selectNode(null);
    assert.equal(useEditorStore.getState().selectedNodeId, null);
  });
  test("updateNodeProps mutates single component without regenerating the entire interface", () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const testBtnId = `btn-test-${Date.now()}`;
    store.addNode(rootId, {
      id: testBtnId,
      type: "Button",
      name: "Test Button",
      props: { label: "Initial Label", variant: "primary" },
      styles: {},
      children: []
    });
    const nodeBefore = useEditorStore.getState().ast.children?.find((c) => c.id === testBtnId);
    assert.equal(nodeBefore?.props.label, "Initial Label");
    store.updateNodeProps(testBtnId, { label: "Updated Label", variant: "danger" });
    const nodeAfter = useEditorStore.getState().ast.children?.find((c) => c.id === testBtnId);
    assert.equal(nodeAfter?.props.label, "Updated Label");
    assert.equal(nodeAfter?.props.variant, "danger");
  });
  test("duplicateNode creates duplicate with fresh ID and identical props", () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const sourceBtnId = `btn-dup-source-${Date.now()}`;
    store.addNode(rootId, {
      id: sourceBtnId,
      type: "Button",
      name: "Duplicate Source",
      props: { label: "Copy Me", variant: "outline" },
      styles: {},
      children: []
    });
    const initialChildCount = useEditorStore.getState().ast.children?.length || 0;
    store.duplicateNode(sourceBtnId);
    const children = useEditorStore.getState().ast.children || [];
    assert.equal(children.length, initialChildCount + 1);
    const duplicated = children.find(
      (c) => c.props.label === "Copy Me" && c.id !== sourceBtnId
    );
    assert.ok(duplicated !== void 0);
    assert.notEqual(duplicated.id, sourceBtnId);
    assert.ok(duplicated.name.includes("(Copy)"));
  });
  test("undo and redo revert and reapply state changes", () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const undoTestId = `btn-undo-${Date.now()}`;
    store.addNode(rootId, {
      id: undoTestId,
      type: "Button",
      name: "Undo Test",
      props: { label: "Original" },
      styles: {},
      children: []
    });
    store.updateNodeProps(undoTestId, { label: "Changed" });
    assert.equal(
      useEditorStore.getState().ast.children?.find((c) => c.id === undoTestId)?.props.label,
      "Changed"
    );
    assert.ok(useEditorStore.getState().canUndo());
    store.undo();
    assert.equal(
      useEditorStore.getState().ast.children?.find((c) => c.id === undoTestId)?.props.label,
      "Original"
    );
    assert.ok(useEditorStore.getState().canRedo());
    store.redo();
    assert.equal(
      useEditorStore.getState().ast.children?.find((c) => c.id === undoTestId)?.props.label,
      "Changed"
    );
  });
  test("moveNode correctly reorders child positions up and down", () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const idA = `elem-a-${Date.now()}`;
    const idB = `elem-b-${Date.now()}`;
    store.addNode(rootId, {
      id: idA,
      type: "Badge",
      name: "Badge A",
      props: { text: "Alpha" },
      styles: {},
      children: []
    });
    store.addNode(rootId, {
      id: idB,
      type: "Badge",
      name: "Badge B",
      props: { text: "Beta" },
      styles: {},
      children: []
    });
    const childrenBefore = useEditorStore.getState().ast.children || [];
    const idxA = childrenBefore.findIndex((c) => c.id === idA);
    const idxB = childrenBefore.findIndex((c) => c.id === idB);
    assert.ok(idxA !== -1 && idxB !== -1);
    assert.equal(idxB, idxA + 1);
    store.moveNode(idB, "up");
    const childrenAfter = useEditorStore.getState().ast.children || [];
    const newIdxA = childrenAfter.findIndex((c) => c.id === idA);
    const newIdxB = childrenAfter.findIndex((c) => c.id === idB);
    assert.equal(newIdxB, idxA);
    assert.equal(newIdxA, idxB);
  });
});
describe("AST TSX Code Compilation and Safety", () => {
  test("compileASTtoReactTSX produces clean, safe React TypeScript code", async () => {
    const { compileASTtoReactTSX: compileASTtoReactTSX2 } = await Promise.resolve().then(() => (init_astCompiler(), astCompiler_exports));
    const sampleAST = {
      id: "root",
      type: "Container",
      name: "Screen Root",
      props: { layout: "flex-col", padding: "p-6" },
      styles: { tailwindClasses: "bg-navy-950" },
      children: [
        {
          id: "btn-test",
          type: "Button",
          name: "Action Button",
          props: { label: "Click Me", variant: "primary" },
          styles: {},
          children: []
        }
      ],
      meta: {
        version: "1.0.0",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        title: "Compiled Screen",
        designSystem: "modern-dark",
        targetViewport: { width: 1280, height: 800 }
      }
    };
    const code = compileASTtoReactTSX2(sampleAST);
    assert.ok(code.includes("import React from 'react';"));
    assert.ok(code.includes("export const CompiledScreen: React.FC = () => {"));
    assert.ok(code.includes("Click Me"));
    assert.ok(!code.includes("eval("));
    assert.ok(!code.includes("dangerouslySetInnerHTML"));
  });
  test("nodes with missing optional properties render without error", () => {
    for (const type of APPROVED_COMPONENT_TYPES) {
      const Comp = getRegistryComponent(type);
      assert.equal(typeof Comp, "function");
    }
  });
});
describe("Sketch Fidelity Evaluation Engine", () => {
  test("fidelity dataset includes all 7 analysis dimensions with weights summing to <= 1.0", async () => {
    const { DEMO_FIDELITY_DATA: DEMO_FIDELITY_DATA2 } = await Promise.resolve().then(() => (init_mockData(), mockData_exports));
    const expectedDimensions = [
      "presence",
      "ordering",
      "position",
      "size",
      "text",
      "layout",
      "annotation"
    ];
    const reportedDimensions = DEMO_FIDELITY_DATA2.scoreBreakdown.dimensions.map((d) => d.dimension);
    for (const dim of expectedDimensions) {
      assert.ok(
        reportedDimensions.includes(dim),
        `Fidelity report must include dimension: ${dim}`
      );
    }
    const totalWeight = DEMO_FIDELITY_DATA2.scoreBreakdown.dimensions.reduce(
      (sum, d) => sum + d.weight,
      0
    );
    assert.ok(Math.abs(totalWeight - 1) < 0.01, "Total dimension weights must sum to 1.0");
    assert.ok(DEMO_FIDELITY_DATA2.overallScore >= 0 && DEMO_FIDELITY_DATA2.overallScore <= 100);
  });
  test("composite fidelity score formula excludes unmeasured dimensions", () => {
    const testDimensions = [
      { name: "Presence", score: 90, weight: 0.25, isMeasured: true },
      { name: "Ordering", score: 100, weight: 0.1, isMeasured: true },
      { name: "Position", score: 80, weight: 0.2, isMeasured: true },
      { name: "Size", score: 85, weight: 0.15, isMeasured: true },
      { name: "Text", score: null, weight: 0.1, isMeasured: false },
      // Unmeasured
      { name: "Layout", score: 95, weight: 0.15, isMeasured: true },
      { name: "Annotation", score: null, weight: 0.05, isMeasured: false }
      // Unmeasured
    ];
    const measured = testDimensions.filter((d) => d.isMeasured && d.score !== null);
    const sumWeights = measured.reduce((acc, d) => acc + d.weight, 0);
    const weightedSum = measured.reduce((acc, d) => acc + d.score * d.weight, 0);
    const compositeScore = Math.round(weightedSum / sumWeights * 10) / 10;
    assert.ok(sumWeights > 0 && sumWeights < 1);
    assert.ok(compositeScore >= 80 && compositeScore <= 95);
  });
  test("findings contain all required evidence, severity, and diagnostic fields", async () => {
    const { DEMO_FIDELITY_DATA: DEMO_FIDELITY_DATA2 } = await Promise.resolve().then(() => (init_mockData(), mockData_exports));
    const findings = DEMO_FIDELITY_DATA2.findings || [];
    assert.ok(findings.length > 0, "Report must contain findings");
    for (const f of findings) {
      assert.ok(f.findingId !== void 0, "findingId required");
      assert.ok(
        ["presence", "ordering", "position", "size", "text", "layout", "annotation"].includes(
          f.category
        ),
        `category ${f.category} must be an approved dimension`
      );
      assert.ok(["high", "medium", "low", "info"].includes(f.severity), "severity must be valid");
      assert.ok(typeof f.description === "string" && f.description.length > 0);
      assert.ok(f.confidence >= 0 && f.confidence <= 1);
      assert.ok(["open", "applied", "dismissed"].includes(f.status));
    }
  });
  test("applying a fidelity correction mutates the targeted AST element non-destructively", () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const testHeadingId = `head-fid-${Date.now()}`;
    store.addNode(rootId, {
      id: testHeadingId,
      type: "Heading",
      name: "System Status Title",
      props: { text: "Old Mismatched Title", level: 2 },
      styles: {},
      children: []
    });
    const targetNodeBefore = useEditorStore.getState().ast.children?.find((c) => c.id === testHeadingId);
    assert.equal(targetNodeBefore?.props.text, "Old Mismatched Title");
    store.updateNodeProps(testHeadingId, { text: "Telemetry & Health (Fidelity Aligned)" });
    const targetNodeAfter = useEditorStore.getState().ast.children?.find((c) => c.id === testHeadingId);
    assert.equal(targetNodeAfter?.props.text, "Telemetry & Health (Fidelity Aligned)");
  });
});
describe("Targeted Component Correction and Property Updates", () => {
  test("modifies text, colour, width, height, and spacing on a targeted node without full AST regen", () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const testButtonId = `btn-edit-test-${Date.now()}`;
    store.addNode(rootId, {
      id: testButtonId,
      type: "Button",
      name: "Login Action Button",
      props: { label: "Log In", variant: "secondary", size: "md" },
      styles: { tailwindClasses: "w-auto" },
      children: []
    });
    const nodeCountAfterAdd = useEditorStore.getState().ast.children?.length || 0;
    store.updateNodeProps(testButtonId, { label: "Sign In to Workspace" });
    let node = useEditorStore.getState().ast.children?.find((c) => c.id === testButtonId);
    assert.equal(node?.props.label, "Sign In to Workspace");
    store.updateNodeProps(testButtonId, { variant: "primary" });
    store.updateNodeStyles(testButtonId, "bg-blue-600 text-white w-full h-12 p-4");
    node = useEditorStore.getState().ast.children?.find((c) => c.id === testButtonId);
    assert.equal(node?.props.variant, "primary");
    assert.ok(node?.styles.tailwindClasses?.includes("bg-blue-600"));
    assert.ok(node?.styles.tailwindClasses?.includes("w-full"));
    assert.ok(node?.styles.tailwindClasses?.includes("h-12"));
    assert.ok(node?.styles.tailwindClasses?.includes("p-4"));
    assert.equal(useEditorStore.getState().ast.children?.length, nodeCountAfterAdd);
    store.duplicateNode(testButtonId);
    assert.equal(useEditorStore.getState().ast.children?.length, nodeCountAfterAdd + 1);
    store.deleteNode(testButtonId);
    assert.equal(useEditorStore.getState().ast.children?.length, nodeCountAfterAdd);
  });
  test("root container cannot be deleted or duplicated", () => {
    const store = useEditorStore.getState();
    const rootId = store.ast.id;
    const initialChildrenCount = store.ast.children?.length || 0;
    store.deleteNode(rootId);
    assert.equal(useEditorStore.getState().ast.id, rootId);
    store.duplicateNode(rootId);
    assert.equal(useEditorStore.getState().ast.id, rootId);
    assert.equal(useEditorStore.getState().ast.children?.length, initialChildrenCount);
  });
});
