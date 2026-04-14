/**
 * RefreshManager - 全局刷新管理器
 * 
 * 功能：
 * 1. 自动刷新定时器（可配置间隔：30秒/60秒/5分钟）
 * 2. 手动刷新触发
 * 3. 刷新状态管理（idle/loading/success/error）
 * 4. 最后更新时间显示
 * 5. 用户设置持久化（LocalStorage）
 * 
 * 用法：
 * ```javascript
 * // 1. 在页面中初始化
 * RefreshManager.init({
 *     onRefresh: async () => {
 *         // 刷新数据的逻辑
 *         await loadData();
 *     },
 *     autoStart: true
 * });
 * 
 * // 2. 手动触发刷新
 * RefreshManager.refresh();
 * 
 * // 3. 停止自动刷新
 * RefreshManager.stop();
 * ```
 */

class RefreshManager {
    constructor() {
        this.config = {
            interval: 60,           // 默认 60 秒
            autoRefresh: true,      // 默认开启自动刷新
        };
        this.timer = null;
        this.lastUpdateTime = null;
        this.status = 'idle';       // idle | loading | success | error
        this.onRefreshCallback = null;
        this.elements = {};
        this.isInitialized = false;
    }

    /**
     * 初始化刷新管理器
     * @param {Object} options - 配置选项
     * @param {Function} options.onRefresh - 刷新回调函数（必需）
     * @param {boolean} options.autoStart - 是否自动开始刷新（默认 true）
     */
    init(options = {}) {
        if (this.isInitialized) {
            console.warn('RefreshManager 已经初始化');
            return;
        }

        if (!options.onRefresh || typeof options.onRefresh !== 'function') {
            throw new Error('RefreshManager.init() 需要 onRefresh 回调函数');
        }

        this.onRefreshCallback = options.onRefresh;

        // 加载用户设置
        this.loadSettings();

        // 渲染刷新控制组件
        this.renderControl();

        // 绑定事件
        this.bindEvents();

        // 更新最后刷新时间显示
        this.updateTimeDisplay();
        setInterval(() => this.updateTimeDisplay(), 10000); // 每 10 秒更新一次显示

        // 自动开始刷新
        if (options.autoStart !== false && this.config.autoRefresh) {
            this.start();
        }

        this.isInitialized = true;
        console.log('✅ RefreshManager 初始化成功', this.config);
    }

    /**
     * 渲染刷新控制组件
     */
    renderControl() {
        // 检查是否已存在容器
        let container = document.getElementById('refresh-control-root');
        if (!container) {
            container = document.createElement('div');
            container.id = 'refresh-control-root';
            document.body.appendChild(container);
        }

        // 加载模板
        const template = this.getTemplate();
        container.innerHTML = template;

        // 缓存元素引用
        this.elements = {
            container: container.querySelector('.refresh-control-container'),
            refreshBtn: document.getElementById('refresh-trigger-btn'),
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.getElementById('status-text'),
            lastUpdateTime: document.getElementById('last-update-time'),
            settingsBtn: document.getElementById('settings-toggle-btn'),
            settingsPanel: document.getElementById('settings-panel'),
            autoRefreshToggle: document.getElementById('auto-refresh-toggle'),
            intervalButtons: document.querySelectorAll('.interval-btn'),
            refreshIcon: container.querySelector('.refresh-icon')
        };

        // 初始化设置面板状态
        this.updateSettingsUI();
    }

    /**
     * 获取组件模板
     */
    getTemplate() {
        return `
            <style>
                .refresh-control-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background-color: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    padding: 10px 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    z-index: 500;
                    transition: all 0.2s;
                }
                .refresh-control-container:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .refresh-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background-color: #1E3A8A;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .refresh-btn:hover:not(:disabled) {
                    background-color: #1E40AF;
                    transform: translateY(-1px);
                }
                .refresh-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .refresh-icon {
                    font-size: 14px;
                    transition: transform 0.5s;
                }
                .refresh-icon.spinning {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .refresh-status {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .status-text {
                    font-size: 12px;
                    color: #6B7280;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .status-indicator {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .status-indicator.idle { background-color: #9CA3AF; }
                .status-indicator.loading {
                    background-color: #3B82F6;
                    animation: pulse 1.5s ease-in-out infinite;
                }
                .status-indicator.success { background-color: #10B981; }
                .status-indicator.error { background-color: #EF4444; }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .last-update-time {
                    font-size: 11px;
                    color: #9CA3AF;
                }
                .settings-btn {
                    background: none;
                    border: none;
                    color: #6B7280;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .settings-btn:hover {
                    background-color: #F3F4F6;
                    color: #1E3A8A;
                }
                .settings-panel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background-color: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    padding: 16px;
                    min-width: 240px;
                    display: none;
                    z-index: 501;
                }
                .settings-panel.show {
                    display: block;
                }
                .settings-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 12px;
                }
                .settings-option {
                    margin-bottom: 12px;
                }
                .settings-option:last-child {
                    margin-bottom: 0;
                }
                .option-label {
                    font-size: 13px;
                    color: #4B5563;
                    margin-bottom: 6px;
                    display: block;
                }
                .interval-buttons {
                    display: flex;
                    gap: 6px;
                }
                .interval-btn {
                    flex: 1;
                    padding: 6px 10px;
                    background-color: #F3F4F6;
                    border: 1px solid #E5E7EB;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .interval-btn:hover {
                    background-color: #E5E7EB;
                }
                .interval-btn.active {
                    background-color: #1E3A8A;
                    color: #FFFFFF;
                    border-color: #1E3A8A;
                }
                .toggle-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .toggle-switch {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background-color: #D1D5DB;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .toggle-switch.active {
                    background-color: #10B981;
                }
                .toggle-slider {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background-color: #FFFFFF;
                    border-radius: 50%;
                    transition: transform 0.2s;
                }
                .toggle-switch.active .toggle-slider {
                    transform: translateX(20px);
                }
                @media (max-width: 768px) {
                    .refresh-control-container {
                        top: 10px;
                        right: 10px;
                        padding: 8px 12px;
                        gap: 8px;
                    }
                    .refresh-btn {
                        padding: 5px 10px;
                        font-size: 12px;
                    }
                }
            </style>

            <div class="refresh-control-container">
                <button class="refresh-btn" id="refresh-trigger-btn">
                    <span class="refresh-icon">🔄</span>
                    <span>刷新</span>
                </button>

                <div class="refresh-status">
                    <div class="status-text">
                        <span class="status-indicator idle" id="status-indicator"></span>
                        <span id="status-text">就绪</span>
                    </div>
                    <div class="last-update-time" id="last-update-time">-</div>
                </div>

                <button class="settings-btn" id="settings-toggle-btn">⚙️</button>

                <div class="settings-panel" id="settings-panel">
                    <div class="settings-title">刷新设置</div>

                    <div class="settings-option">
                        <label class="option-label">自动刷新</label>
                        <div class="toggle-container">
                            <span style="font-size: 12px; color: #6B7280;">关闭/开启</span>
                            <div class="toggle-switch" id="auto-refresh-toggle">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                    </div>

                    <div class="settings-option">
                        <label class="option-label">刷新间隔</label>
                        <div class="interval-buttons">
                            <button class="interval-btn" data-interval="30">30秒</button>
                            <button class="interval-btn active" data-interval="60">60秒</button>
                            <button class="interval-btn" data-interval="300">5分钟</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 刷新按钮点击
        this.elements.refreshBtn.addEventListener('click', () => {
            this.refresh();
        });

        // 设置按钮点击
        this.elements.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.settingsPanel.classList.toggle('show');
        });

        // 点击外部关闭设置面板
        document.addEventListener('click', (e) => {
            if (!this.elements.container.contains(e.target)) {
                this.elements.settingsPanel.classList.remove('show');
            }
        });

        // 自动刷新开关
        this.elements.autoRefreshToggle.addEventListener('click', () => {
            this.config.autoRefresh = !this.config.autoRefresh;
            this.saveSettings();
            this.updateSettingsUI();

            if (this.config.autoRefresh) {
                this.start();
            } else {
                this.stop();
            }
        });

        // 刷新间隔按钮
        this.elements.intervalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const interval = parseInt(btn.dataset.interval);
                this.setInterval(interval);
            });
        });
    }

    /**
     * 手动触发刷新
     */
    async refresh() {
        if (this.status === 'loading') {
            console.log('正在刷新中，跳过...');
            return;
        }

        this.setStatus('loading', '刷新中...');

        try {
            await this.onRefreshCallback();
            this.lastUpdateTime = Date.now();
            this.setStatus('success', '刷新成功');
            
            // 2秒后恢复就绪状态
            setTimeout(() => {
                if (this.status === 'success') {
                    this.setStatus('idle', '就绪');
                }
            }, 2000);
        } catch (error) {
            console.error('刷新失败:', error);
            this.setStatus('error', '刷新失败');
            
            // 3秒后恢复就绪状态
            setTimeout(() => {
                if (this.status === 'error') {
                    this.setStatus('idle', '就绪');
                }
            }, 3000);
        }
    }

    /**
     * 设置状态
     */
    setStatus(status, text) {
        this.status = status;
        
        // 更新状态指示器
        this.elements.statusIndicator.className = `status-indicator ${status}`;
        this.elements.statusText.textContent = text;

        // 更新刷新按钮
        this.elements.refreshBtn.disabled = (status === 'loading');
        
        // 更新刷新图标动画
        if (status === 'loading') {
            this.elements.refreshIcon.classList.add('spinning');
        } else {
            this.elements.refreshIcon.classList.remove('spinning');
        }
    }

    /**
     * 开始自动刷新
     */
    start() {
        this.stop(); // 先停止现有定时器
        
        this.timer = setInterval(() => {
            this.refresh();
        }, this.config.interval * 1000);

        console.log(`⏰ 自动刷新已启动，间隔 ${this.config.interval} 秒`);
    }

    /**
     * 停止自动刷新
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log('⏸️ 自动刷新已停止');
        }
    }

    /**
     * 设置刷新间隔
     */
    setInterval(seconds) {
        this.config.interval = seconds;
        this.saveSettings();
        this.updateSettingsUI();

        if (this.config.autoRefresh) {
            this.start(); // 重启定时器
        }

        console.log(`⏱️ 刷新间隔已设置为 ${seconds} 秒`);
    }

    /**
     * 更新设置面板 UI
     */
    updateSettingsUI() {
        // 更新自动刷新开关
        if (this.config.autoRefresh) {
            this.elements.autoRefreshToggle.classList.add('active');
        } else {
            this.elements.autoRefreshToggle.classList.remove('active');
        }

        // 更新间隔按钮
        this.elements.intervalButtons.forEach(btn => {
            const interval = parseInt(btn.dataset.interval);
            if (interval === this.config.interval) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * 更新最后刷新时间显示
     */
    updateTimeDisplay() {
        if (!this.lastUpdateTime) {
            this.elements.lastUpdateTime.textContent = '尚未刷新';
            return;
        }

        const now = Date.now();
        const diff = now - this.lastUpdateTime;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        let timeText = '';
        if (seconds < 10) {
            timeText = '刚刚';
        } else if (seconds < 60) {
            timeText = `${seconds} 秒前`;
        } else if (minutes < 60) {
            timeText = `${minutes} 分钟前`;
        } else {
            timeText = `${hours} 小时前`;
        }

        this.elements.lastUpdateTime.textContent = `最后更新: ${timeText}`;
    }

    /**
     * 保存设置到 LocalStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('quantviz_refresh_settings', JSON.stringify(this.config));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    /**
     * 从 LocalStorage 加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('quantviz_refresh_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.config = { ...this.config, ...settings };
                console.log('📥 已加载用户设置:', this.config);
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    /**
     * 销毁管理器
     */
    destroy() {
        this.stop();
        const root = document.getElementById('refresh-control-root');
        if (root) {
            root.remove();
        }
        this.isInitialized = false;
        console.log('🗑️ RefreshManager 已销毁');
    }
}

// 创建全局单例
window.RefreshManager = new RefreshManager();
