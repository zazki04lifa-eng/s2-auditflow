/**
 * AuditFlow AI - Interactive Flowchart Editor
 * Drag & drop editor menggunakan Drawflow
 */

import { Drawflow } from 'drawflow';

/**
 * @typedef {Object} EditorConfig
 * @property {string} containerId
 * @property {boolean} [showWcgw]
 * @property {Function} [onSave]
 */

class InteractiveFlowchartEditor {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.showWcgw = config.showWcgw !== false;
    this.onSave = config.onSave || (() => {});
    
    this.editor = null;
    this.currentData = null;
    this.wcgwEntries = [];
    
    if (!this.container) {
      throw new Error(`Container with id "${config.containerId}" not found`);
    }
    
    this.init();
  }
  
  init() {
    // Initialize Drawflow
    this.editor = new Drawflow(this.container);
    this.editor.reroute = true;
    this.editor.reroute_fix_curvature = true;
    this.editor.force_first_input = false;
    this.editor.force_last_output = false;
    
    // Set custom node templates
    this.registerNodeTemplates();
    
    // Bind events
    this.bindEvents();
    
    // Start editor
    this.editor.start();
    
    console.log('✅ Interactive editor initialized');
  }
  
  registerNodeTemplates() {
    // Start node template
    this.editor.registerNode('start', `
      <div class="drawflow_node start-node">
        <header><span class="node-icon">▶</span> <span class="node-title">Start</span></header>
        <div class="node-content">
          <input type="text" class="node-label-input" placeholder="Label..." value="Mulai">
        </div>
        <div class="drawflow_outputs"><div class="output" data-output="1"></div></div>
      </div>
    `);
    
    // Process node template
    this.editor.registerNode('process', `
      <div class="drawflow_node process-node">
        <header><span class="node-icon">⬡</span> <span class="node-title">Process</span></header>
        <div class="node-content">
          <input type="text" class="node-label-input" placeholder="Label..." value="Proses">
        </div>
        <div class="drawflow_inputs"><div class="input" data-input="1"></div></div>
        <div class="drawflow_outputs"><div class="output" data-output="1"></div></div>
      </div>
    `);
    
    // Decision node template
    this.editor.registerNode('decision', `
      <div class="drawflow_node decision-node">
        <header><span class="node-icon">◇</span> <span class="node-title">Decision</span></header>
        <div class="node-content">
          <input type="text" class="node-label-input" placeholder="Question?" value="Decision">
        </div>
        <div class="drawflow_inputs"><div class="input" data-input="1"></div></div>
        <div class="drawflow_outputs">
          <div class="output" data-output="1" style="border-color: #14a394;"></div>
          <div class="output" data-output="2" style="border-color: #e53e3e;"></div>
        </div>
      </div>
    `);
    
    // Document node template
    this.editor.registerNode('document', `
      <div class="drawflow_node document-node">
        <header><span class="node-icon">📄</span> <span class="node-title">Document</span></header>
        <div class="node-content">
          <input type="text" class="node-label-input" placeholder="Label..." value="Dokumen">
        </div>
        <div class="drawflow_inputs"><div class="input" data-input="1"></div></div>
        <div class="drawflow_outputs"><div class="output" data-output="1"></div></div>
      </div>
    `);
    
    // Terminator node template
    this.editor.registerNode('terminator', `
      <div class="drawflow_node terminator-node">
        <header><span class="node-icon">⏹</span> <span class="node-title">End</span></header>
        <div class="node-content">
          <input type="text" class="node-label-input" placeholder="Label..." value="Selesai">
        </div>
        <div class="drawflow_inputs"><div class="input" data-input="1"></div></div>
      </div>
    `);
  }
  
  bindEvents() {
    // Node added
    this.editor.on('nodeCreated', (nodeId) => {
      console.log('Node created:', nodeId);
      this.setupNodeEvents(nodeId);
    });
    
    // Node moved
    this.editor.on('nodeMoved', (nodeId) => {
      console.log('Node moved:', nodeId);
    });
    
    // Node removed
    this.editor.on('nodeRemoved', (nodeId) => {
      console.log('Node removed:', nodeId);
      // Remove associated WCGW
      this.wcgwEntries = this.wcgwEntries.filter(w => w.nodeId !== nodeId);
    });
    
    // Connection created
    this.editor.on('connectionCreated', (connection) => {
      console.log('Connection created:', connection);
    });
    
    // Connection removed
    this.editor.on('connectionRemoved', (connection) => {
      console.log('Connection removed:', connection);
    });
    
    // Editor updated
    this.editor.on('export', (data) => {
      console.log('Editor exported:', data);
    });
  }
  
  setupNodeEvents(nodeId) {
    const nodeElement = this.editor.editor.querySelector(`.parent-node-id-${nodeId}`);
    if (!nodeElement) return;
    
    // Setup label input
    const labelInput = nodeElement.querySelector('.node-label-input');
    if (labelInput) {
      labelInput.addEventListener('change', (e) => {
        const node = this.editor.getFromNodeId(nodeId);
        if (node) {
          node.data.label = e.target.value;
        }
      });
    }
    
    // Add delete button
    const header = nodeElement.querySelector('header');
    if (header && !header.querySelector('.node-delete-btn')) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'node-delete-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.onclick = () => {
        this.editor.removeNodeId(nodeId);
      };
      header.appendChild(deleteBtn);
    }
  }
  
  /**
   * Load flowchart data into editor
   * @param {import('../types/index.js').FlowchartData} data
   * @param {import('../types/index.js').WcgwEntry[]} wcgwEntries
   */
  loadData(data, wcgwEntries = []) {
    if (!data) return;
    
    this.currentData = data;
    this.wcgwEntries = wcgwEntries;
    
    // Clear existing
    this.editor.clear();
    
    // Load lanes as separate sections (Drawflow doesn't have native swimlanes)
    // We'll position nodes based on lane assignments
    const laneOffsets = {};
    let laneIndex = 0;
    
    data.lanes.forEach(lane => {
      laneOffsets[lane.id] = laneIndex * 300;
      laneIndex++;
    });
    
    // Add nodes
    data.nodes.forEach(node => {
      const laneOffset = laneOffsets[node.laneId] || 0;
      const x = node.position.x + laneOffset;
      const y = node.position.y;
      
      const nodeId = this.editor.addNode(
        node.type,
        1, // inputs
        node.type === 'decision' ? 2 : 1, // outputs
        x,
        y,
        node.type,
        { label: node.label, originalId: node.id },
        node.type
      );
      
      // Setup node events
      this.setupNodeEvents(nodeId);
      
      // Set initial label
      const nodeElement = this.editor.editor.querySelector(`.parent-node-id-${nodeId}`);
      if (nodeElement) {
        const labelInput = nodeElement.querySelector('.node-label-input');
        if (labelInput) {
          labelInput.value = node.label;
        }
      }
    });
    
    // Add connections
    data.edges.forEach(edge => {
      // Find Drawflow node IDs by original IDs
      const sourceNode = data.nodes.find(n => n.id === edge.sourceNodeId);
      const targetNode = data.nodes.find(n => n.id === edge.targetNodeId);
      
      if (sourceNode && targetNode) {
        // Get Drawflow node IDs (they're sequential)
        const drawflowNodes = this.editor.getNodes();
        const sourceDrawflowId = Object.keys(drawflowNodes).find(id => 
          drawflowNodes[id].data.originalId === edge.sourceNodeId
        );
        const targetDrawflowId = Object.keys(drawflowNodes).find(id => 
          drawflowNodes[id].data.originalId === edge.targetNodeId
        );
        
        if (sourceDrawflowId && targetDrawflowId) {
          this.editor.addConnection(
            sourceDrawflowId,
            targetDrawflowId,
            'output_1',
            'input_1'
          );
        }
      }
    });
    
    console.log('✅ Flowchart data loaded into editor');
  }
  
  /**
   * Get current flowchart data
   * @returns {import('../types/index.js').FlowchartData}
   */
  getData() {
    const drawflowData = this.editor.export();
    const nodes = [];
    const edges = [];
    const lanes = new Set();
    
    // Convert Drawflow nodes to our format
    Object.entries(drawflowData.drawflow.Home.data).forEach(([id, node]) => {
      // Determine lane based on x position
      const laneIndex = Math.floor(node.pos_x / 300);
      const laneId = `lane-${laneIndex}`;
      lanes.add(laneId);
      
      nodes.push({
        id: node.data.originalId || `node-${id}`,
        type: node.name,
        label: node.data.label || node.name,
        position: {
          x: node.pos_x % 300, // Relative to lane
          y: node.pos_y
        },
        laneId: laneId
      });
    });
    
    // Convert connections
    Object.entries(drawflowData.drawflow.Home.data).forEach(([sourceId, node]) => {
      if (node.outputs && node.outputs.output_1 && node.outputs.output_1.connections) {
        node.outputs.output_1.connections.forEach(conn => {
          const targetNode = drawflowData.drawflow.Home.data[conn.node];
          if (targetNode) {
            edges.push({
              id: `edge-${sourceId}-${conn.node}`,
              sourceNodeId: node.data.originalId || `node-${sourceId}`,
              targetNodeId: targetNode.data.originalId || `node-${conn.node}`
            });
          }
        });
      }
    });
    
    return {
      lanes: Array.from(lanes).map((id, index) => ({
        id,
        name: `Lane ${index + 1}`,
        order: index
      })),
      nodes,
      edges
    };
  }
  
  /**
   * Save current state
   */
  save() {
    const data = this.getData();
    this.onSave(data);
    console.log('✅ Flowchart saved');
    return data;
  }
  
  /**
   * Destroy editor
   */
  destroy() {
    if (this.editor) {
      this.editor.removeConnection();
      this.editor.clear();
      this.editor = null;
    }
  }
}

export { InteractiveFlowchartEditor };
