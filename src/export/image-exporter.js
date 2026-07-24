/**
 * AuditFlow AI - Image Exporter
 * Export flowchart ke format PNG/JPG menggunakan canvas
 */

/**
 * @typedef {import('../types/index.js').FlowchartData} FlowchartData
 * @typedef {import('../types/index.js').WcgwEntry} WcgwEntry
 * @typedef {import('../types/index.js').FlowchartOptions} FlowchartOptions
 */

export class ImageExporter {
  /**
   * Export flowchart SVG ke format gambar (PNG/JPG)
   * @param {string} svgString - SVG string dari flowchart
   * @param {'png' | 'jpg'} format - Format output
   * @param {Object} options - Options export
   * @param {number} [options.scale=2] - Scale factor untuk resolusi
   * @param {string} [options.backgroundColor='#ffffff'] - Background color
   * @returns {Promise<Blob>} - Blob hasil export
   */
  async exportFromSvg(svgString, format = 'png', options = {}) {
    const { scale = 2, backgroundColor = '#ffffff' } = options;
    
    return new Promise((resolve, reject) => {
      try {
        // Buat image dari SVG string
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          try {
            // Buat canvas dengan ukuran yang di-scale
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            
            // Isi background
            if (backgroundColor) {
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(0, 0, img.width, img.height);
            }
            
            // Gambar image
            ctx.drawImage(img, 0, 0);
            
            // Convert ke format yang diminta
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpg' ? 0.92 : undefined;
            
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(url);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Gagal membuat blob dari canvas'));
              }
            }, mimeType, quality);
          } catch (error) {
            URL.revokeObjectURL(url);
            reject(error);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Gagal memuat SVG sebagai image'));
        };
        
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Download blob sebagai file
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Nama file
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Export flowchart langsung dari FlowchartRenderer
   * @param {Object} renderer - FlowchartRenderer instance
   * @param {FlowchartData} flowchartData - Data flowchart
   * @param {FlowchartOptions} options - Options rendering
   * @param {WcgwEntry[]} [wcgwEntries] - WCGW entries untuk ditampilkan
   * @param {'png' | 'jpg'} [format='png'] - Format output
   * @returns {Promise<Blob>}
   */
  async exportFlowchart(renderer, flowchartData, options, wcgwEntries = [], format = 'png') {
    // Render flowchart ke SVG
    const svgString = renderer.render(flowchartData, {
      ...options,
      showWcgw: wcgwEntries.length > 0,
    });
    
    // Export ke gambar
    return this.exportFromSvg(svgString, format, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
  }
  
  /**
   * Convert data URL ke blob
   * @param {string} dataUrl - Data URL
   * @returns {Promise<Blob>}
   */
  async dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return response.blob();
  }
}
