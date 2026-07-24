/**
 * AuditFlow AI - Type Definitions (JSDoc)
 * Data model untuk seluruh aplikasi
 */

/**
 * @typedef {'input' | 'flowchart' | 'analysis' | 'review'} ProjectStage
 */

/**
 * @typedef {'text' | 'docx' | 'pdf'} SourceType
 */

/**
 * @typedef {Object} SourceInput
 * @property {SourceType} type
 * @property {string} rawText
 * @property {string} [fileName]
 */

/**
 * @typedef {'vertical' | 'horizontal'} FlowchartOrientation
 */

/**
 * @typedef {Object} FlowchartOptions
 * @property {FlowchartOrientation} orientation
 * @property {string} style
 * @property {boolean} showWcgw
 */

/**
 * @typedef {'start' | 'process' | 'decision' | 'document' | 'data' | 'terminator'} NodeType
 */

/**
 * @typedef {Object} NodePosition
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} FlowchartNode
 * @property {string} id
 * @property {NodeType} type
 * @property {string} label
 * @property {NodePosition} position
 * @property {string} laneId
 * @property {string[]} [wcgwRefs]
 * @property {Object} [data]
 */

/**
 * @typedef {Object} FlowchartEdge
 * @property {string} id
 * @property {string} sourceNodeId
 * @property {string} targetNodeId
 * @property {string} [sourceOutput]
 * @property {string} [targetInput]
 * @property {string} [label]
 */

/**
 * @typedef {Object} FlowchartLane
 * @property {string} id
 * @property {string} name
 * @property {number} [order]
 */

/**
 * @typedef {Object} FlowchartData
 * @property {FlowchartLane[]} lanes
 * @property {FlowchartNode[]} nodes
 * @property {FlowchartEdge[]} edges
 */

/**
 * @typedef {'low' | 'medium' | 'high' | 'critical'} RiskLevel
 */

/**
 * @typedef {'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain'} Likelihood
 */

/**
 * @typedef {'insignificant' | 'minor' | 'moderate' | 'major' | 'catastrophic'} Impact
 */

/**
 * @typedef {Object} ExistingControl
 * @property {string} description
 * @property {boolean} [designEffective]
 * @property {boolean} [operatingEffective]
 * @property {string} [frequency]
 * @property {string} [owner]
 */

/**
 * @typedef {Object} WcgwEntry
 * @property {string} id
 * @property {string} nodeId
 * @property {string} description
 * @property {RiskLevel} riskLevel
 * @property {Likelihood} likelihood
 * @property {Impact} impact
 * @property {string} rootCauseDraft
 * @property {ExistingControl} [existingControl]
 * @property {string} [controlGap]
 * @property {number} [confidenceScore]
 * @property {string} [standardRef]
 */

/**
 * @typedef {Object} ExecutiveSummary
 * @property {string} overview
 * @property {string} keyRisks
 * @property {string} recommendations
 * @property {string} conclusion
 */

/**
 * @typedef {Object} RiskItem
 * @property {string} id
 * @property {string} description
 * @property {RiskLevel} level
 * @property {string} category
 * @property {string} impact
 * @property {string} likelihood
 * @property {WcgwEntry} [wcgw]
 */

/**
 * @typedef {Object} ControlItem
 * @property {string} id
 * @property {string} description
 * @property {string} type
 * @property {string} frequency
 * @property {string} owner
 * @property {boolean} effective
 * @property {string} [gap]
 */

/**
 * @typedef {'occurrence' | 'completeness' | 'accuracy' | 'cutoff' | 'classification' | 'existence' | 'rights' | 'valuation'} AssertionType
 */

/**
 * @typedef {Object} AssertionItem
 * @property {AssertionType} type
 * @property {string} description
 * @property {RiskItem[]} relevantRisks
 * @property {string} auditResponse
 */

/**
 * @typedef {Object} AuditProcedure
 * @property {string} id
 * @property {string} assertionType
 * @property {string} procedure
 * @property {string} nature
 * @property {string} timing
 * @property {string} extent
 * @property {string} [sampleSize]
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} id
 * @property {string} description
 * @property {string} priority
 * @property {string} timeline
 * @property {string} responsibleParty
 */

/**
 * @typedef {Object} AnalysisSection
 * @property {ExecutiveSummary} [executiveSummary]
 * @property {RiskItem[]} [risks]
 * @property {ControlItem[]} [controls]
 * @property {AssertionItem[]} [assertions]
 * @property {string[]} [auditResponse]
 * @property {AuditProcedure[]} [auditProcedures]
 * @property {Recommendation[]} [recommendations]
 * @property {string} [conclusion]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} client
 * @property {string} industry
 * @property {string} area
 * @property {string} auditor
 * @property {string} framework
 * @property {ProjectStage} stage
 * @property {SourceInput} sourceInput
 * @property {FlowchartOptions} flowchartOptions
 * @property {FlowchartData} flowchartData
 * @property {AnalysisSection[]} analysisData
 * @property {boolean} flowchartLocked
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// Export untuk type checking
export const Types = {
  Project: /** @type {Project} */ ({}),
  WcgwEntry: /** @type {WcgwEntry} */ ({}),
  FlowchartNode: /** @type {FlowchartNode} */ ({}),
  FlowchartEdge: /** @type {FlowchartEdge} */ ({}),
  FlowchartLane: /** @type {FlowchartLane} */ ({})
};
