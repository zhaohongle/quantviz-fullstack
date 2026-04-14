#!/usr/bin/env python3
"""批量为 HTML 文件添加暗黑主题引用"""

import re
import os

# 需要处理的文件列表
files_to_update = [
    'pages/prd3/accuracy.html',
    'pages/filter/smart-filter.html',
    'pages/stocks/kline.html',
    'pages/watchlist/index.html',
    'pages/settings/index.html',
    'pages/search/index.html'
]

# 暗黑主题引用
dark_theme_link = '    <link rel="stylesheet" href="../../css/dark-theme.css">'

# 颜色替换映射
color_replacements = [
    # 背景色
    ('background-color: #F9FAFB', 'background: var(--bg)'),
    ('background-color: #FFFFFF', 'background: var(--bg-card)'),
    ('background-color: #F3F4F6', 'background: var(--bg-hover)'),
    ('background: #F9FAFB', 'background: var(--bg)'),
    ('background: #FFFFFF', 'background: var(--bg-card)'),
    
    # 文字色
    ('color: #111827', 'color: var(--text)'),
    ('color: #6B7280', 'color: var(--text-sec)'),
    ('color: #9CA3AF', 'color: var(--text-dim)'),
    ('color: #374151', 'color: var(--text-sec)'),
    
    # 边框
    ('border: 1px solid #E5E7EB', 'border: 1px solid var(--border)'),
    ('border-color: #E5E7EB', 'border-color: var(--border)'),
    
    # 主色调
    ('background-color: #1E3A8A', 'background: linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(59, 130, 246, 0.2))'),
    ('color: #3B82F6', 'color: var(--primary)'),
    
    # 涨跌色
    ('color: #EF4444', 'color: var(--up)'),
    ('color: #10B981', 'color: var(--down)'),
]

base_dir = os.path.dirname(os.path.abspath(__file__)) + '/../'

for file_path in files_to_update:
    full_path = os.path.join(base_dir, file_path)
    
    if not os.path.exists(full_path):
        print(f'✗ 文件不存在: {file_path}')
        continue
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经添加了暗黑主题
        if 'dark-theme.css' in content:
            print(f'○ 已有主题: {file_path}')
        else:
            # 在 </title> 后添加主题引用
            content = content.replace('</title>', f'</title>\n{dark_theme_link}')
            print(f'✓ 添加主题: {file_path}')
        
        # 替换颜色
        replacement_count = 0
        for old_color, new_color in color_replacements:
            if old_color in content:
                content = content.replace(old_color, new_color)
                replacement_count += 1
        
        if replacement_count > 0:
            print(f'  └─ 替换了 {replacement_count} 处颜色')
        
        # 写回文件
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    except Exception as e:
        print(f'✗ 处理失败 {file_path}: {e}')

print('\n✅ 批量处理完成！')
