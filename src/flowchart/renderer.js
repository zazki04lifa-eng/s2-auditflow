/**
 * AuditFlow AI - Flowchart Renderer
 * Render swimlane flowchart statis (SVG) dari flowchartData
 */

/**
 * @typedef {Object} RendererConfig
 * @property {string} containerId
 * @property {'vertical' | 'horizontal'} [orientation]
 * @property {boolean} [showWcgw]
 * @property {number} [laneWidth]
 * @property {number} [nodeSpacing]
 */

/**
 * @typedef {Object} WcgwBadge
 * @property {string} id
 * @property {string} nodeId
 * @property {string} description
 * @property {string} riskLevel
 */

class FlowchartRenderer {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.orientation = config.orientation || 'vertical';
    this.showWcgw = config.showWcgw !== false;
    this.laneWidth = config.laneWidth || 200;
    this.nodeSpacing = config.nodeSpacing || 80;
    
    this.svg = null;
    this.data = null;
    this.wcgwBadges = [];
    
    if (!this.container) {
      throw new Error(`Container with id "${config.containerId}" not found`);
    }
  }
  
  /**
   * Render flowchart from flowchartData
   * @param {import('../types/index.js').FlowchartData} data
   * @param {WcgwBadge[]} [wcgwBadges]
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
    
    // Calculate dimensions
    const dimensions = this.calculateDimensions(data);
    
    // Create SVG
    this.svg = this.createSvgElement(dimensions);
    
    // Render lanes
    this.renderLanes(data.lanes, dimensions);
    
    // Render nodes
    this.renderNodes(data.nodes, dimensions);
    
    // Render edges
    this.renderEdges(data.edges, data.nodes, dimensions);
    
    // Render WCGW badges
    if (this.showWcgw && wcgwBadges.length > 0) {
      this.renderWcgwBadges(wcgwBadges, data.nodes, dimensions);
    }
    
    // Append to container
    this.container.appendChild(this.svg);
    
    console.log('✅ Flowchart rendered:', data.nodes.length, 'nodes,', data.edges.length, 'edges');
  }
  
  /**
   * Calculate layout dimensions
   * @param {import('../types/index.js').FlowchartData} data
   * @returns {{ width: number, height: number, lanePositions: Map<string, number>, nodePositions: Map<string, {x: number, y: number}> }}
   */
  calculateDimensions(data) {
    const isVertical = this.orientation === 'vertical';
    const lanes = data.lanes;
    const nodes = data.nodes;
    
    // Group nodes by lane
    const nodesByLane = new Map();
    lanes.forEach(lane => nodesByLane.set(lane.id, []));
    nodes.forEach(node => {
      const laneNodes = nodesByLane.get(node.laneId) || [];
      laneNodes.push(node);
      nodesByLane.set(node.laneId, laneNodes);
    });
    
    // Calculate lane positions
    const lanePositions = new Map();
    const maxNodesInLane = Math.max(...lanes.map(l => (nodesByLane.get(l.id) || []).length), 1);
    
    lanes.forEach((lane, index) => {
      lanePositions.set(lane.id, index * this.laneWidth);
    });
    
    // Calculate node positions
    const nodePositions = new Map();
    nodes.forEach(node => {
      const laneNodes = nodesByLane.get(node.laneId) || [];
      const nodeIndex = laneNodes.indexOf(node);
      
      let x, y;
      if (isVertical) {
        x = lanePositions.get(node.laneId) + this.laneWidth / 2;
        y = nodeIndex * this.nodeSpacing + 60; // Header offset
      } else {
        y = lanePositions.get(node.laneId) + this.laneWidth / 2;
        x = nodeIndex * this.nodeSpacing + 60;
      }
      
      nodePositions.set(node.id, { x, y });
    });
    
    // Calculate total dimensions
    const totalWidth = isVertical
      ? lanes.length * this.laneWidth + 40
      : maxNodesInLane * this.nodeSpacing + 120;
    
    const totalHeight = isVertical
      ? maxNodesInLane * this.nodeSpacing + 120
      : lanes.length * this.laneWidth + 40;
    
    return {
      width: totalWidth,
      height: totalHeight,
      lanePositions,
      nodePositions,
      nodesByLane,
      maxNodesInLane
    };
  }
  
  /**
   * Create SVG element
   * @param {{ width: number, height: number }} dimensions
   * @returns {SVGSVGElement}
   */
  createSvgElement(dimensions) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', dimensions.width);
    svg.setAttribute('height', dimensions.height);
    svg.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
    svg.setAttribute('class', 'flowchart-svg');
    svg.style.background = '#f7f9fb';
    svg.style.borderRadius = '10px';
    svg.style.border = '1px solid #e2e6ec';
    
    // Add defs for arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#2c4d80"/>
      </marker>
    `;
    svg.appendChild(defs);
    
    return svg;
  }
  
  /**
   * Render swimlanes
   * @param {import('../types/index.js').FlowchartLane[]} lanes
   * @param {{ width: number, height: number, lanePositions: Map }} dimensions
   */
  renderLanes(lanes, dimensions) {
    const isVertical = this.orientation === 'vertical';
    
    lanes.forEach((lane, index) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', `lane lane-${index}`);
      
      // Lane background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      
      if (isVertical) {
        rect.setAttribute('x', dimensions.lanePositions.get(lane.id));
        rect.setAttribute('y', 0);
        rect.setAttribute('width', this.laneWidth);
        rect.setAttribute('height', dimensions.height);
      } else {
        rect.setAttribute('x', 0);
        rect.setAttribute('y', dimensions.lanePositions.get(lane.id));
        rect.setAttribute('width', dimensions.width);
        rect.setAttribute('height', this.laneWidth);
      }
      
      rect.setAttribute('fill', index % 2 === 0 ? '#ffffff' : '#f4f7fb');
      rect.setAttribute('stroke', '#e2e6ec');
      rect.setAttribute('stroke-width', '1');
      
      // Lane label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      
      if (isVertical) {
        text.setAttribute('x', dimensions.lanePositions.get(lane.id) + 10);
        text.setAttribute('y', 30);
      } else {
        text.setAttribute('x', 10);
        text.setAttribute('y', dimensions.lanePositions.get(lane.id) + 20);
      }
      
      text.setAttribute('fill', '#1e3a63');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '600');
      text.textContent = lane.name;
      
      group.appendChild(rect);
      group.appendChild(text);
      this.svg.appendChild(group);
    });
  }
  
  /**
   * Render nodes
   * @param {import('../types/index.js').FlowchartNode[]} nodes
   * @param {{ nodePositions: Map }} dimensions
   */
  renderNodes(nodes, dimensions) {
    nodes.forEach(node => {
      const pos = dimensions.nodePositions.get(node.id);
      if (!pos) return;
      
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', `node node-${node.id}`);
      group.setAttribute('data-node-id', node.id);
      
      // Node shape based on type
      let shape;
      const nodeWidth = 100;
      const nodeHeight = 50;
      
      switch (node.type) {
        case 'start':
        case 'terminator':
          // Rounded rectangle (capsule)
          shape = this.createRoundedRect(pos.x - nodeWidth/2, pos.y - nodeHeight/2, nodeWidth, nodeHeight, 25);
          shape.setAttribute('fill', node.type === 'start' ? '#14a394' : '#c53030');
          break;
          
        case 'process':
          // Rectangle
          shape = this.createRect(pos.x - nodeWidth/2, pos.y - nodeHeight/2, nodeWidth, nodeHeight);
          shape.setAttribute('fill', '#3d63a3');
          break;
          
        case 'decision':
          // Diamond
          shape = this.createDiamond(pos.x, pos.y, nodeWidth, nodeHeight);
          shape.setAttribute('fill', '#d69e2e');
          break;
          
        case 'document':
          // Document shape
          shape = this.createDocumentShape(pos.x - nodeWidth/2, pos.y - nodeHeight/2, nodeWidth, nodeHeight);
          shape.setAttribute('fill', '#7c8494');
          break;
          
        case 'data':
          // Parallelogram
          shape = this.createParallelogram(pos.x - nodeWidth/2, pos.y - nodeHeight/2, nodeWidth, nodeHeight);
          shape.setAttribute('fill', '#1e3a63');
          break;
          
        default:
          shape = this.createRect(pos.x - nodeWidth/2, pos.y - nodeHeight/2, nodeWidth, nodeHeight);
          shape.setAttribute('fill', '#3d63a3');
      }
      
      shape.setAttribute('stroke', '#1e3a63');
      shape.setAttribute('stroke-width', '2');
      
      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', '500');
      text.textContent = this.truncateText(node.label, 12);
      
      group.appendChild(shape);
      group.appendChild(text);
      this.svg.appendChild(group);
    });
  }
  
  /**
   * Render edges (connectors)
   * @param {import('../types/index.js').FlowchartEdge[]} edges
   * @param {import('../types/index.js').FlowchartNode[]} nodes
   * @param {{ nodePositions: Map }} dimensions
   */
  renderEdges(edges, nodes, dimensions) {
    edges.forEach(edge => {
      const sourcePos = dimensions.nodePositions.get(edge.sourceNodeId);
      const targetPos = dimensions.nodePositions.get(edge.targetNodeId);
      
      if (!sourcePos || !targetPos) return;
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = this.calculatePath(sourcePos, targetPos, nodes, dimensions);
      
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#2c4d80');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      
      this.svg.appendChild(path);
      
      // Edge label
      if (edge.label) {
        const midPoint = this.getMidPoint(sourcePos, targetPos);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', midPoint.x);
        label.setAttribute('y', midPoint.y - 10);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', '#2c4d80');
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', '600');
        label.textContent = edge.label;
        
        this.svg.appendChild(label);
      }
    });
  }
  
  /**
   * Calculate path between two nodes
   */
  calculatePath(source, target, nodes, dimensions) {
    const isVertical = this.orientation === 'vertical';
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    if (isVertical) {
      // Vertical flow: go down from source, then horizontal, then down to target
      const midY = source.y + Math.abs(dy) / 2;
      return `M ${source.x} ${source.y + 25} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${target.y - 25}`;
    } else {
      // Horizontal flow: go right from source, then vertical, then right to target
      const midX = source.x + Math.abs(dx) / 2;
      return `M ${source.x + 50} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x - 50} ${target.y}`;
    }
  }
  
  /**
   * Get midpoint between two positions
   */
  getMidPoint(source, target) {
    return {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2
    };
  }
  
  /**
   * Render WCGW badges on nodes
   */
  renderWcgwBadges(wcgwBadges, nodes, dimensions) {
    wcgwBadges.forEach(badge => {
      const node = nodes.find(n => n.id === badge.nodeId);
      if (!node) return;
      
      const pos = dimensions.nodePositions.get(node.id);
      if (!pos) return;
      
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', `wcgw-badge wcgw-${badge.riskLevel}`);
      
      // Badge circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x + 40);
      circle.setAttribute('cy', pos.y - 20);
      circle.setAttribute('r', 12);
      
      // Color based on risk level
      const colors = {
        low: '#14a394',
        medium: '#d69e2e',
        high: '#e53e3e',
        critical: '#c53030'
      };
      circle.setAttribute('fill', colors[badge.riskLevel] || '#d69e2e');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      
      // Badge text (exclamation mark or risk level initial)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x + 40);
      text.setAttribute('y', pos.y - 16);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', '700');
      text.textContent = badge.riskLevel.charAt(0).toUpperCase();
      
      group.appendChild(circle);
      group.appendChild(text);
      this.svg.appendChild(group);
      
      // Add title for tooltip
      group.innerHTML += `<title>${badge.description}</title>`;
    });
  }
  
  /**
   * Update orientation
   * @param {'vertical' | 'horizontal'} orientation
   */
  setOrientation(orientation) {
    if (this.orientation !== orientation && this.data) {
      this.orientation = orientation;
      this.render(this.data, this.wcgwBadges);
    }
  }
  
  /**
   * Toggle WCGW display
   * @param {boolean} show
   */
  setShowWcgw(show) {
    if (this.showWcgw !== show && this.data) {
      this.showWcgw = show;
      this.render(this.data, this.wcgwBadges);
    }
  }
  
  // Helper methods for shapes
  createRect(x, y, width, height) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    return rect;
  }
  
  createRoundedRect(x, y, width, height, radius) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', radius);
    rect.setAttribute('ry', radius);
    return rect;
  }
  
  createDiamond(cx, cy, width, height) {
    const points = [
      `${cx},${cy - height/2}`,
      `${cx + width/2},${cy}`,
      `${cx},${cy + height/2}`,
      `${cx - width/2},${cy}`
    ].join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    return polygon;
  }
  
  createDocumentShape(x, y, width, height) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const foldSize = 10;
    const d = `
      M ${x} ${y}
      L ${x + width - foldSize} ${y}
      L ${x + width} ${y + foldSize}
      L ${x + width} ${y + height}
      L ${x} ${y + height}
      Z
    `;
    path.setAttribute('d', d.replace(/\s+/g, ' ').trim());
    return path;
  }
  
  createParallelogram(x, y, width, height) {
    const offset = 15;
    const points = [
      `${x + offset},${y}`,
      `${x + width},${y}`,
      `${x + width - offset},${y + height}`,
      `${x},${y + height}`
    ].join(' ');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    return polygon;
  }
  
  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}

export { FlowchartRenderer };
