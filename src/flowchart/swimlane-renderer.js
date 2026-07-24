/**
 * AuditFlow AI - Enhanced Swimlane Renderer
 * Render swimlane flowchart dengan visualisasi kolom/baris yang benar
 * 
 * Aturan:
 * 1. Posisi X (vertikal) ditentukan oleh index lane: x = laneIndex * laneWidth
 * 2. Header lane di bagian atas setiap kolom
 * 3. Posisi Y ditentukan urutan kemunculan node dalam alur
 * 4. Node dalam lane sama berbaris di kolom X yang sama
 */

/**
 * @typedef {Object} SwimlaneConfig
 * @property {string} containerId
 * @property {'vertical' | 'horizontal'} [orientation]
 * @property {boolean} [showWcgw]
 * @property {number} [laneWidth]
 * @property {number} [nodeSpacing]
 */

export class SwimlaneRenderer {
    constructor(config) {
        this.container = document.getElementById(config.containerId);
        this.orientation = config.orientation || 'vertical';
        this.showWcgw = config.showWcgw !== false;
        this.laneWidth = config.laneWidth || 220;
        this.nodeSpacing = config.nodeSpacing || 90;
        this.headerHeight = 50;
        this.nodeWidth = 120;
        this.nodeHeight = 50;

        this.svg = null;
        this.data = null;
        this.wcgwBadges = [];

        if (!this.container) {
            throw new Error(`Container with id "${config.containerId}" not found`);
        }
    }

    /**
     * Render flowchart from flowchartData
     * @param {Object} data
     * @param {Array} [wcgwBadges]
     */
    render(data, wcgwBadges = []) {
        if (!data || !data.lanes || !data.nodes) {
            console.error('Invalid flowchart data');
            return;
        }

        this.data = data;
        this.wcgwBadges = wcgwBadges;

        // Clear container
        this.container.innerHTML = '';

        // Calculate dimensions and positions
        const layout = this.calculateLayout(data);

        // Create SVG
        this.svg = this.createSvgElement(layout);

        // Add defs for arrow markers and gradients
        this.addSvgDefs();

        // Render swimlanes (background + header)
        this.renderSwimlanes(data.lanes, layout);

        // Render nodes
        this.renderNodes(data.nodes, layout);

        // Render edges (connectors)
        this.renderEdges(data.edges, data.nodes, layout);

        // Render WCGW badges
        if (this.showWcgw && wcgwBadges.length > 0) {
            this.renderWcgwBadges(wcgwBadges, data.nodes, layout);
        }

        // Append to container
        this.container.appendChild(this.svg);

        console.log('✅ Swimlane flowchart rendered:', data.nodes.length, 'nodes,', data.lanes.length, 'lanes');
    }

    /**
     * Calculate layout dimensions and node positions
     * @param {Object} data
     * @returns {Object} Layout information
     */
    calculateLayout(data) {
        const isVertical = this.orientation === 'vertical';
        const lanes = data.lanes;
        const nodes = data.nodes;

        // Create lane index map
        const laneIndexMap = new Map();
        lanes.forEach((lane, index) => {
            laneIndexMap.set(lane.id, index);
        });

        // Group nodes by lane and calculate order
        const nodesByLane = new Map();
        lanes.forEach(lane => nodesByLane.set(lane.id, []));

        // Track node order within each lane based on flow
        const nodeOrder = new Map();
        let globalOrder = 0;

        // Simple topological sort - process nodes in order they appear in edges
        const visited = new Set();

        // Start from start nodes
        const startNodes = nodes.filter(n => n.type === 'start' || n.type === 'terminator');

        const traverseNodes = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const node = nodes.find(n => n.id === nodeId);
            if (!node) return;

            nodeOrder.set(nodeId, globalOrder++);

            // Find outgoing edges
            const outgoingEdges = data.edges.filter(e => e.sourceNodeId === nodeId);
            outgoingEdges.forEach(edge => {
                traverseNodes(edge.targetNodeId);
            });
        };

        startNodes.forEach(node => traverseNodes(node.id));

        // Process remaining nodes
        nodes.forEach(node => {
            if (!visited.has(node.id)) {
                nodeOrder.set(node.id, globalOrder++);
            }
        });

        // Assign nodes to lanes with proper ordering
        nodes.forEach(node => {
            const laneNodes = nodesByLane.get(node.laneId) || [];
            laneNodes.push({ ...node, order: nodeOrder.get(node.id) });
            nodesByLane.set(node.laneId, laneNodes);
        });

        // Sort nodes within each lane by order
        nodesByLane.forEach((laneNodes, laneId) => {
            laneNodes.sort((a, b) => a.order - b.order);
            nodesByLane.set(laneId, laneNodes);
        });

        // Calculate lane positions
        const lanePositions = new Map();
        lanes.forEach((lane, index) => {
            lanePositions.set(lane.id, index * this.laneWidth);
        });

        // Calculate node positions
        const nodePositions = new Map();
        const nodeLaneIndex = new Map(); // Track which row within lane

        lanes.forEach(lane => {
            const laneNodes = nodesByLane.get(lane.id) || [];
            laneNodes.forEach((node, index) => {
                nodeLaneIndex.set(node.id, index);

                let x, y;
                if (isVertical) {
                    // X determined by lane index (column)
                    x = lanePositions.get(lane.id) + this.laneWidth / 2;
                    // Y determined by order within lane (row)
                    y = this.headerHeight + index * this.nodeSpacing + this.nodeSpacing / 2;
                } else {
                    // Horizontal: transpose
                    y = lanePositions.get(lane.id) + this.laneWidth / 2;
                    x = this.headerHeight + index * this.nodeSpacing + this.nodeSpacing / 2;
                }

                nodePositions.set(node.id, { x, y });
            });
        });

        // Calculate total dimensions
        const maxNodesInAnyLane = Math.max(...lanes.map(l => (nodesByLane.get(l.id) || []).length), 1);

        const totalWidth = isVertical
            ? lanes.length * this.laneWidth + 40
            : maxNodesInAnyLane * this.nodeSpacing + this.headerHeight + 80;

        const totalHeight = isVertical
            ? maxNodesInAnyLane * this.nodeSpacing + this.headerHeight + 80
            : lanes.length * this.laneWidth + 40;

        return {
            width: totalWidth,
            height: totalHeight,
            lanePositions,
            nodePositions,
            nodeLaneIndex,
            nodesByLane,
            laneIndexMap,
            maxNodesInLane: maxNodesInAnyLane,
            isVertical
        };
    }

    /**
     * Create SVG element
     * @param {Object} layout
     * @returns {SVGSVGElement}
     */
    createSvgElement(layout) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', layout.width);
        svg.setAttribute('height', layout.height);
        svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
        svg.setAttribute('class', 'swimlane-flowchart-svg');
        svg.style.background = '#f7f9fb';
        svg.style.borderRadius = '10px';
        svg.style.border = '1px solid #e2e6ec';
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';

        return svg;
    }

    /**
     * Add SVG definitions (markers, gradients, etc.)
     */
    addSvgDefs() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Arrow marker
        defs.innerHTML = `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#2c4d80"/>
      </marker>
      
      <!-- Lane header gradient -->
      <linearGradient id="laneHeaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#2c4d80;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3d63a3;stop-opacity:1" />
      </linearGradient>
      
      <!-- Shadow filter -->
      <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.15"/>
      </filter>
    `;

        this.svg.appendChild(defs);
    }

    /**
     * Render swimlanes with headers
     * @param {Array} lanes
     * @param {Object} layout
     */
    renderSwimlanes(lanes, layout) {
        const isVertical = layout.isVertical;
        const laneColors = ['#ffffff', '#f4f7fb', '#ffffff', '#f4f7fb', '#ffffff'];

        lanes.forEach((lane, index) => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', `swimlane lane-${index}`);

            // Lane background (the entire column/row)
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            if (isVertical) {
                bgRect.setAttribute('x', layout.lanePositions.get(lane.id));
                bgRect.setAttribute('y', this.headerHeight);
                bgRect.setAttribute('width', this.laneWidth);
                bgRect.setAttribute('height', layout.height - this.headerHeight);
            } else {
                bgRect.setAttribute('x', this.headerHeight);
                bgRect.setAttribute('y', layout.lanePositions.get(lane.id));
                bgRect.setAttribute('width', layout.width - this.headerHeight);
                bgRect.setAttribute('height', this.laneWidth);
            }

            bgRect.setAttribute('fill', laneColors[index % laneColors.length]);
            bgRect.setAttribute('stroke', '#e2e6ec');
            bgRect.setAttribute('stroke-width', '1');

            // Lane header (the label area)
            const headerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            if (isVertical) {
                headerRect.setAttribute('x', layout.lanePositions.get(lane.id));
                headerRect.setAttribute('y', 0);
                headerRect.setAttribute('width', this.laneWidth);
                headerRect.setAttribute('height', this.headerHeight);
            } else {
                headerRect.setAttribute('x', 0);
                headerRect.setAttribute('y', layout.lanePositions.get(lane.id));
                headerRect.setAttribute('width', this.headerHeight);
                headerRect.setAttribute('height', this.laneWidth);
            }

            headerRect.setAttribute('fill', 'url(#laneHeaderGradient)');
            headerRect.setAttribute('stroke', '#1e3a63');
            headerRect.setAttribute('stroke-width', '1');

            // Lane header label
            const headerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');

            if (isVertical) {
                headerText.setAttribute('x', layout.lanePositions.get(lane.id) + this.laneWidth / 2);
                headerText.setAttribute('y', this.headerHeight / 2 + 5);
                headerText.setAttribute('text-anchor', 'middle');
            } else {
                // Rotate text for horizontal orientation
                headerText.setAttribute('x', this.headerHeight / 2);
                headerText.setAttribute('y', layout.lanePositions.get(lane.id) + this.laneWidth / 2);
                headerText.setAttribute('text-anchor', 'middle');
                headerText.setAttribute('transform', `rotate(-90, ${this.headerHeight / 2}, ${layout.lanePositions.get(lane.id) + this.laneWidth / 2})`);
            }

            headerText.setAttribute('fill', '#ffffff');
            headerText.setAttribute('font-size', '13');
            headerText.setAttribute('font-weight', '700');
            headerText.setAttribute('font-family', 'Inter, sans-serif');
            headerText.textContent = lane.name;

            // Lane separator line
            const separatorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            if (isVertical) {
                separatorLine.setAttribute('x1', layout.lanePositions.get(lane.id) + this.laneWidth);
                separatorLine.setAttribute('y1', this.headerHeight);
                separatorLine.setAttribute('x2', layout.lanePositions.get(lane.id) + this.laneWidth);
                separatorLine.setAttribute('y2', layout.height);
            } else {
                separatorLine.setAttribute('x1', this.headerHeight);
                separatorLine.setAttribute('y1', layout.lanePositions.get(lane.id) + this.laneWidth);
                separatorLine.setAttribute('x2', layout.width);
                separatorLine.setAttribute('y2', layout.lanePositions.get(lane.id) + this.laneWidth);
            }
            separatorLine.setAttribute('stroke', '#c8ced8');
            separatorLine.setAttribute('stroke-width', '2');
            separatorLine.setAttribute('stroke-dasharray', '5,5');

            group.appendChild(bgRect);
            group.appendChild(headerRect);
            group.appendChild(headerText);
            group.appendChild(separatorLine);
            this.svg.appendChild(group);
        });
    }

    /**
     * Render nodes
     * @param {Array} nodes
     * @param {Object} layout
     */
    renderNodes(nodes, layout) {
        nodes.forEach(node => {
            const pos = layout.nodePositions.get(node.id);
            if (!pos) return;

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', `node node-${node.id}`);
            group.setAttribute('data-node-id', node.id);
            group.setAttribute('filter', 'url(#nodeShadow)');

            // Node shape and color based on type
            let shape;
            let fillColor;
            let strokeColor = '#1e3a63';
            let textColor = '#ffffff';

            switch (node.type) {
                case 'start':
                    // Green capsule
                    shape = this.createRoundedRect(
                        pos.x - this.nodeWidth / 2,
                        pos.y - this.nodeHeight / 2,
                        this.nodeWidth,
                        this.nodeHeight,
                        25
                    );
                    fillColor = '#14a394';
                    break;

                case 'terminator':
                case 'end':
                    // Red capsule
                    shape = this.createRoundedRect(
                        pos.x - this.nodeWidth / 2,
                        pos.y - this.nodeHeight / 2,
                        this.nodeWidth,
                        this.nodeHeight,
                        25
                    );
                    fillColor = '#c53030';
                    break;

                case 'process':
                    // Blue rectangle
                    shape = this.createRect(
                        pos.x - this.nodeWidth / 2,
                        pos.y - this.nodeHeight / 2,
                        this.nodeWidth,
                        this.nodeHeight
                    );
                    fillColor = '#3d63a3';
                    break;

                case 'decision':
                    // Amber diamond
                    shape = this.createDiamond(pos.x, pos.y, this.nodeWidth, this.nodeHeight);
                    fillColor = '#d69e2e';
                    break;

                case 'document':
                    // Gray document shape
                    shape = this.createDocumentShape(
                        pos.x - this.nodeWidth / 2,
                        pos.y - this.nodeHeight / 2,
                        this.nodeWidth,
                        this.nodeHeight
                    );
                    fillColor = '#7c8494';
                    break;

                default:
                    shape = this.createRect(
                        pos.x - this.nodeWidth / 2,
                        pos.y - this.nodeHeight / 2,
                        this.nodeWidth,
                        this.nodeHeight
                    );
                    fillColor = '#3d63a3';
            }

            shape.setAttribute('fill', fillColor);
            shape.setAttribute('stroke', strokeColor);
            shape.setAttribute('stroke-width', '2');

            // Node label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', textColor);
            text.setAttribute('font-size', '11');
            text.setAttribute('font-weight', '600');
            text.setAttribute('font-family', 'Inter, sans-serif');
            text.textContent = this.truncateText(node.label, 15);

            // Add node number
            const laneIndex = layout.nodeLaneIndex.get(node.id);
            if (laneIndex !== undefined) {
                const numBadge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                numBadge.setAttribute('cx', pos.x + this.nodeWidth / 2 - 8);
                numBadge.setAttribute('cy', pos.y - this.nodeHeight / 2 - 5);
                numBadge.setAttribute('r', '10');
                numBadge.setAttribute('fill', '#1e3a63');
                numBadge.setAttribute('stroke', '#ffffff');
                numBadge.setAttribute('stroke-width', '2');

                const numText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                numText.setAttribute('x', pos.x + this.nodeWidth / 2 - 8);
                numText.setAttribute('y', pos.y - this.nodeHeight / 2 - 2);
                numText.setAttribute('text-anchor', 'middle');
                numText.setAttribute('fill', '#ffffff');
                numText.setAttribute('font-size', '10');
                numText.setAttribute('font-weight', '700');
                numText.textContent = laneIndex + 1;

                group.appendChild(numBadge);
                group.appendChild(numText);
            }

            group.appendChild(shape);
            group.appendChild(text);
            this.svg.appendChild(group);
        });
    }

    /**
     * Render edges (connectors)
     * @param {Array} edges
     * @param {Array} nodes
     * @param {Object} layout
     */
    renderEdges(edges, nodes, layout) {
        edges.forEach(edge => {
            const sourcePos = layout.nodePositions.get(edge.sourceNodeId);
            const targetPos = layout.nodePositions.get(edge.targetNodeId);

            if (!sourcePos || !targetPos) return;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = this.calculateEdgePath(sourcePos, targetPos, edge, layout);

            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#2c4d80');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('marker-end', 'url(#arrowhead)');

            this.svg.appendChild(path);

            // Edge label (for decision branches)
            if (edge.label) {
                const midPoint = this.getEdgeLabelPosition(sourcePos, targetPos, edge, layout);
                const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                const labelWidth = edge.label.length * 7 + 10;
                labelBg.setAttribute('x', midPoint.x - labelWidth / 2);
                labelBg.setAttribute('y', midPoint.y - 12);
                labelBg.setAttribute('width', labelWidth);
                labelBg.setAttribute('height', 20);
                labelBg.setAttribute('fill', '#ffffff');
                labelBg.setAttribute('stroke', '#2c4d80');
                labelBg.setAttribute('rx', '4');

                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', midPoint.x);
                label.setAttribute('y', midPoint.y + 4);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('fill', '#2c4d80');
                label.setAttribute('font-size', '10');
                label.setAttribute('font-weight', '600');
                label.setAttribute('font-family', 'Inter, sans-serif');
                label.textContent = edge.label;

                this.svg.appendChild(labelBg);
                this.svg.appendChild(label);
            }
        });
    }

    /**
     * Calculate edge path with proper routing
     */
    calculateEdgePath(source, target, edge, layout) {
        const isVertical = layout.isVertical;
        const dx = target.x - source.x;
        const dy = target.y - source.y;

        // If same lane (vertical flow)
        if (Math.abs(dx) < 10) {
            // Straight down
            return `M ${source.x} ${source.y + this.nodeHeight / 2} L ${target.x} ${target.y - this.nodeHeight / 2}`;
        }

        // If moving to different lane
        if (isVertical) {
            // Vertical then horizontal then vertical
            const midY = source.y + this.nodeSpacing * 0.4;
            return `M ${source.x} ${source.y + this.nodeHeight / 2} 
              L ${source.x} ${midY} 
              L ${target.x} ${midY} 
              L ${target.x} ${target.y - this.nodeHeight / 2}`;
        } else {
            // Horizontal then vertical then horizontal
            const midX = source.x + this.nodeSpacing * 0.4;
            return `M ${source.x + this.nodeWidth / 2} ${source.y} 
              L ${midX} ${source.y} 
              L ${midX} ${target.y} 
              L ${target.x - this.nodeWidth / 2} ${target.y}`;
        }
    }

    /**
     * Get position for edge label
     */
    getEdgeLabelPosition(source, target, edge, layout) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        // Offset label slightly
        if (layout.isVertical) {
            return { x: midX + 15, y: midY - 10 };
        } else {
            return { x: midX - 10, y: midY - 15 };
        }
    }

    /**
     * Render WCGW badges on nodes
     */
    renderWcgwBadges(wcgwBadges, nodes, layout) {
        wcgwBadges.forEach(badge => {
            const node = nodes.find(n => n.id === badge.nodeId);
            if (!node) return;

            const pos = layout.nodePositions.get(node.id);
            if (!pos) return;

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // Badge circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pos.x + this.nodeWidth / 2 + 5);
            circle.setAttribute('cy', pos.y - this.nodeHeight / 2 - 5);
            circle.setAttribute('r', '12');

            // Color based on risk level
            const riskColors = {
                critical: '#dc2626',
                high: '#ea580c',
                medium: '#d97706',
                low: '#6b7280'
            };

            const color = riskColors[badge.riskLevel?.toLowerCase()] || riskColors.medium;
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', '#ffffff');
            circle.setAttribute('stroke-width', '2');

            // Exclamation mark
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x + this.nodeWidth / 2 + 5);
            text.setAttribute('y', pos.y - this.nodeHeight / 2 - 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#ffffff');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', '700');
            text.textContent = '!';

            group.appendChild(circle);
            group.appendChild(text);
            this.svg.appendChild(group);
        });
    }

    // Helper methods for creating shapes

    createRect(x, y, width, height) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('rx', '4');
        return rect;
    }

    createRoundedRect(x, y, width, height, rx) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('rx', rx);
        return rect;
    }

    createDiamond(cx, cy, width, height) {
        const points = `${cx},${cy - height / 2} ${cx + width / 2},${cy} ${cx},${cy + height / 2} ${cx - width / 2},${cy}`;
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points);
        polygon.setAttribute('rx', '4');
        return polygon;
    }

    createDocumentShape(x, y, width, height) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const foldSize = 10;
        path.setAttribute('d', `
      M ${x} ${y + height}
      L ${x} ${y + foldSize}
      L ${x + foldSize} ${y}
      L ${x + width} ${y}
      L ${x + width} ${y + height}
      Z
    `);
        return path;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * Set orientation
     */
    setOrientation(orientation) {
        this.orientation = orientation;
        if (this.data) {
            this.render(this.data, this.wcgwBadges);
        }
    }

    /**
     * Clear renderer
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.svg = null;
        this.data = null;
        this.wcgwBadges = [];
    }
}
