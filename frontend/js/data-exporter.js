// ========== 数据导出工具 ==========

class DataExporter {
  constructor() {
    this.init();
  }

  init() {
    // 为所有列表页添加导出按钮
    this.addExportButtons();
  }

  // 添加导出按钮
  addExportButtons() {
    const tables = document.querySelectorAll('table, .stock-list, .watchlist-grid');
    
    tables.forEach(table => {
      if (table.querySelector('.export-btn')) return; // 已存在则跳过
      
      const exportBtn = this.createExportButton(table);
      table.parentElement.insertBefore(exportBtn, table);
    });
  }

  createExportButton(container) {
    const btnGroup = document.createElement('div');
    btnGroup.className = 'export-btn-group';
    btnGroup.innerHTML = `
      <button class="export-btn" onclick="dataExporter.showExportMenu(this)">
        📥 导出
        <span class="export-arrow">▼</span>
      </button>
      <div class="export-menu">
        <div class="export-menu-item" onclick="dataExporter.exportCSV(this)">
          📄 导出为 CSV
        </div>
        <div class="export-menu-item" onclick="dataExporter.exportJSON(this)">
          📋 导出为 JSON
        </div>
        <div class="export-menu-item" onclick="dataExporter.exportPDF(this)">
          📑 导出为 PDF
        </div>
      </div>
    `;

    this.addExportStyles();
    return btnGroup;
  }

  addExportStyles() {
    if (document.getElementById('export-styles')) return;

    const style = document.createElement('style');
    style.id = 'export-styles';
    style.textContent = `
      .export-btn-group {
        position: relative;
        display: inline-block;
        margin-bottom: 1rem;
      }

      .export-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;
      }

      .export-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .export-arrow {
        font-size: 0.7rem;
        transition: transform 0.3s;
      }

      .export-btn.active .export-arrow {
        transform: rotate(180deg);
      }

      .export-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 0.5rem;
        background: #1a1a2e;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        min-width: 200px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: none;
        z-index: 1000;
      }

      .export-menu.show {
        display: block;
        animation: slideDown 0.2s ease;
      }

      .export-menu-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: all 0.3s;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .export-menu-item:last-child {
        border-bottom: none;
      }

      .export-menu-item:hover {
        background: rgba(102, 126, 234, 0.1);
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    document.head.appendChild(style);
  }

  showExportMenu(button) {
    const menu = button.parentElement.querySelector('.export-menu');
    const isActive = button.classList.contains('active');

    // 关闭所有其他菜单
    document.querySelectorAll('.export-btn.active').forEach(btn => {
      btn.classList.remove('active');
      btn.parentElement.querySelector('.export-menu').classList.remove('show');
    });

    if (!isActive) {
      button.classList.add('active');
      menu.classList.add('show');
    }
  }

  // ========== CSV 导出 ==========

  exportCSV(menuItem) {
    const container = menuItem.closest('.export-btn-group').nextElementSibling;
    const data = this.extractData(container);
    
    if (!data || data.length === 0) {
      alert('没有数据可导出');
      return;
    }

    const csv = this.convertToCSV(data);
    this.downloadFile(csv, `数据导出_${this.getTimestamp()}.csv`, 'text/csv');
    
    this.closeMenu(menuItem);
    this.showNotification('✓ CSV 导出成功', 'success');
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    // 表头
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');

    // 数据行
    const dataRows = data.map(row => {
      return headers.map(header => {
        let value = row[header] || '';
        // 处理包含逗号的字段
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',');
    });

    return headerRow + '\n' + dataRows.join('\n');
  }

  // ========== JSON 导出 ==========

  exportJSON(menuItem) {
    const container = menuItem.closest('.export-btn-group').nextElementSibling;
    const data = this.extractData(container);
    
    if (!data || data.length === 0) {
      alert('没有数据可导出');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, `数据导出_${this.getTimestamp()}.json`, 'application/json');
    
    this.closeMenu(menuItem);
    this.showNotification('✓ JSON 导出成功', 'success');
  }

  // ========== PDF 导出 ==========

  exportPDF(menuItem) {
    const container = menuItem.closest('.export-btn-group').nextElementSibling;
    
    // 简单的 PDF 导出（使用 window.print）
    // 在生产环境中可以使用 jsPDF 等库
    
    // 创建临时打印样式
    const printStyle = document.createElement('style');
    printStyle.id = 'print-style';
    printStyle.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .export-btn-group,
        .topnav,
        .mobile-nav-bar {
          display: none !important;
        }
        ${container.id ? `#${container.id}` : '.print-content'}, 
        ${container.id ? `#${container.id}` : '.print-content'} * {
          visibility: visible;
        }
        ${container.id ? `#${container.id}` : '.print-content'} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(printStyle);

    // 添加打印类
    container.classList.add('print-content');

    // 触发打印
    window.print();

    // 清理
    setTimeout(() => {
      printStyle.remove();
      container.classList.remove('print-content');
    }, 1000);

    this.closeMenu(menuItem);
    this.showNotification('✓ 准备打印/保存为 PDF', 'info');
  }

  // ========== 数据提取 ==========

  extractData(container) {
    // 从表格提取
    if (container.tagName === 'TABLE') {
      return this.extractFromTable(container);
    }

    // 从卡片列表提取
    const cards = container.querySelectorAll('.stock-card, .search-item, .watchlist-item');
    if (cards.length > 0) {
      return this.extractFromCards(cards);
    }

    // 从自定义列表提取
    const rows = container.querySelectorAll('[data-export]');
    if (rows.length > 0) {
      return this.extractFromCustomRows(rows);
    }

    return [];
  }

  extractFromTable(table) {
    const data = [];
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const rowData = {};
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        rowData[headers[index] || `列${index + 1}`] = cell.textContent.trim();
      });
      data.push(rowData);
    });

    return data;
  }

  extractFromCards(cards) {
    const data = [];
    
    cards.forEach(card => {
      const rowData = {};
      
      // 提取常见字段
      const name = card.querySelector('.stock-name, .search-item-name, h3');
      if (name) rowData['名称'] = name.textContent.trim();

      const code = card.querySelector('.stock-code, .search-item-code');
      if (code) rowData['代码'] = code.textContent.trim();

      const price = card.querySelector('.stock-price, .search-item-price');
      if (price) rowData['价格'] = price.textContent.trim();

      const change = card.querySelector('.stock-change, .search-item-change');
      if (change) rowData['涨跌幅'] = change.textContent.trim();

      data.push(rowData);
    });

    return data;
  }

  extractFromCustomRows(rows) {
    const data = [];
    
    rows.forEach(row => {
      const rowData = JSON.parse(row.dataset.export || '{}');
      data.push(rowData);
    });

    return data;
  }

  // ========== 文件下载 ==========

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // ========== 辅助函数 ==========

  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  closeMenu(menuItem) {
    const btnGroup = menuItem.closest('.export-btn-group');
    const button = btnGroup.querySelector('.export-btn');
    const menu = btnGroup.querySelector('.export-menu');
    
    button.classList.remove('active');
    menu.classList.remove('show');
  }

  showNotification(message, type = 'info') {
    if (window.errorHandler) {
      window.errorHandler.showNotification(message, type);
    } else {
      alert(message);
    }
  }
}

// 初始化数据导出工具
let dataExporter;
document.addEventListener('DOMContentLoaded', () => {
  dataExporter = new DataExporter();
  
  // 监听 DOM 变化，自动为新增的列表添加导出按钮
  const observer = new MutationObserver(() => {
    dataExporter.addExportButtons();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// 导出为全局对象
window.dataExporter = dataExporter;

// 点击外部关闭菜单
document.addEventListener('click', (e) => {
  if (!e.target.closest('.export-btn-group')) {
    document.querySelectorAll('.export-menu.show').forEach(menu => {
      menu.classList.remove('show');
      menu.previousElementSibling.classList.remove('active');
    });
  }
});
