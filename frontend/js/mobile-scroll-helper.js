/**
 * ========== 移动端横向滚动辅助工具 ==========
 * 用途：为表格和图表添加横向滚动指示器
 */

(function() {
    'use strict';

    /**
     * 初始化横向滚动指示器
     */
    function initScrollIndicators() {
        const scrollContainers = document.querySelectorAll('.scroll-container-x, .table-wrapper, .chart-scroll-wrapper, .cards-scroll-container');

        scrollContainers.forEach(container => {
            // 检查是否需要滚动
            if (container.scrollWidth > container.clientWidth) {
                addScrollIndicators(container);
                updateScrollIndicators(container);

                // 监听滚动事件
                container.addEventListener('scroll', () => {
                    updateScrollIndicators(container);
                });
            }
        });
    }

    /**
     * 添加滚动指示器元素
     */
    function addScrollIndicators(container) {
        // 避免重复添加
        if (container.querySelector('.scroll-indicator')) return;

        // 左侧指示器
        const leftIndicator = document.createElement('div');
        leftIndicator.className = 'scroll-indicator scroll-indicator-left';
        leftIndicator.innerHTML = '◀';

        // 右侧指示器
        const rightIndicator = document.createElement('div');
        rightIndicator.className = 'scroll-indicator scroll-indicator-right';
        rightIndicator.innerHTML = '▶';

        // 相对定位容器
        if (window.getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        container.appendChild(leftIndicator);
        container.appendChild(rightIndicator);
    }

    /**
     * 更新滚动指示器显示状态
     */
    function updateScrollIndicators(container) {
        const leftIndicator = container.querySelector('.scroll-indicator-left');
        const rightIndicator = container.querySelector('.scroll-indicator-right');

        if (!leftIndicator || !rightIndicator) return;

        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        // 左侧指示器（不在最左侧时显示）
        if (scrollLeft > 10) {
            leftIndicator.classList.add('show');
        } else {
            leftIndicator.classList.remove('show');
        }

        // 右侧指示器（不在最右侧时显示）
        if (scrollLeft < maxScroll - 10) {
            rightIndicator.classList.add('show');
        } else {
            rightIndicator.classList.remove('show');
        }
    }

    /**
     * 触摸滚动优化（惯性滚动）
     */
    function initTouchScroll() {
        const scrollContainers = document.querySelectorAll('.scroll-container-x, .table-wrapper, .chart-scroll-wrapper');

        scrollContainers.forEach(container => {
            let isDown = false;
            let startX;
            let scrollLeftStart;
            let velocity = 0;
            let lastX = 0;
            let lastTime = Date.now();

            container.addEventListener('touchstart', (e) => {
                isDown = true;
                startX = e.touches[0].pageX - container.offsetLeft;
                scrollLeftStart = container.scrollLeft;
                velocity = 0;
                lastX = e.touches[0].pageX;
                lastTime = Date.now();
            });

            container.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                e.preventDefault();

                const x = e.touches[0].pageX - container.offsetLeft;
                const walk = (x - startX) * 1.5; // 滚动速度倍数
                container.scrollLeft = scrollLeftStart - walk;

                // 计算速度
                const now = Date.now();
                const dt = now - lastTime;
                if (dt > 0) {
                    velocity = (e.touches[0].pageX - lastX) / dt;
                }
                lastX = e.touches[0].pageX;
                lastTime = now;
            });

            container.addEventListener('touchend', () => {
                isDown = false;

                // 惯性滚动
                if (Math.abs(velocity) > 0.1) {
                    let momentumScroll = velocity * 100;
                    const targetScroll = container.scrollLeft - momentumScroll;

                    container.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * 表格横向滚动优化
     */
    function initTableScroll() {
        const tables = document.querySelectorAll('table');

        tables.forEach(table => {
            // 如果表格未包裹在滚动容器中，自动包裹
            if (!table.closest('.table-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper scroll-container-x';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    /**
     * K 线图横向滚动优化
     */
    function initChartScroll() {
        const charts = document.querySelectorAll('.chart-container canvas, .chart-container svg');

        charts.forEach(chart => {
            const container = chart.closest('.chart-container');
            if (container && !container.querySelector('.chart-scroll-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'chart-scroll-wrapper scroll-container-x';
                chart.parentNode.insertBefore(wrapper, chart);
                wrapper.appendChild(chart);
            }
        });
    }

    /**
     * 卡片横向滚动优化（吸附效果）
     */
    function initCardScroll() {
        const cardContainers = document.querySelectorAll('.cards-scroll-container');

        cardContainers.forEach(container => {
            // CSS scroll-snap 已处理，这里添加触摸反馈
            container.addEventListener('scroll', () => {
                // 可选：添加滚动到特定卡片的逻辑
            });
        });
    }

    /**
     * 响应式检测：仅在移动端执行
     */
    function isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * 初始化所有横向滚动功能
     */
    function init() {
        if (!isMobile()) return;

        initTableScroll();
        initChartScroll();
        initScrollIndicators();
        initTouchScroll();
        initCardScroll();

        // 监听窗口调整大小
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (isMobile()) {
                    initScrollIndicators();
                }
            }, 200);
        });

        console.log('✅ 移动端横向滚动优化已启用');
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露全局方法
    window.mobileScrollHelper = {
        init,
        initScrollIndicators,
        updateScrollIndicators
    };
})();
