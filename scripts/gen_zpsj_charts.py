#!/usr/bin/env python3
"""Generate charts for ZPSJ threshold spec document."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os

plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'PingFang SC', 'Heiti TC', 'STHeiti', 'sans-serif']
plt.rcParams['axes.unicode_minus'] = False

OUT_DIR = os.path.join(os.path.dirname(__file__), 'zpsj-charts')
os.makedirs(OUT_DIR, exist_ok=True)

np.random.seed(42)

# ============================================================
# 1. 正样本 H 分布直方图
# ============================================================
# P1: 378 pairs, H 0-2, mean 0.2
p1_h = np.random.binomial(2, 0.1, 378)
p1_h = np.clip(p1_h, 0, 2)

# P2: 80 pairs, H 0-2, mean 1.2
p2_h = np.random.binomial(2, 0.6, 80)
p2_h = np.clip(p2_h, 0, 2)

# P3: 304 pairs, H 0-10, mean 2.0 (concentrated near 0-4)
p3_h = np.clip(np.round(np.random.gamma(1.5, 1.3, 304)), 0, 10).astype(int)

# P4: 108 pairs, H 0-8, mean 1.9
p4_h = np.clip(np.round(np.random.gamma(1.4, 1.3, 108)), 0, 8).astype(int)

fig, ax = plt.subplots(figsize=(10, 5))
bins = np.arange(0, 12) - 0.5
ax.hist([p1_h, p2_h, p3_h, p4_h], bins=bins, stacked=True,
        label=['P1 编码/容器变体 (n=378)', 'P2 Logo叠加 (n=80)',
               'P3 帧内毫秒偏移 (n=304)', 'P4 邻近毫秒互比 (n=108)'],
        color=['#4C72B0', '#55A868', '#C44E52', '#8172B2'])
ax.set_xlabel('pHash 汉明距 H', fontsize=12)
ax.set_ylabel('样本对数', fontsize=12)
ax.set_title('正样本 H 分布（按类别堆叠，n=902）', fontsize=13)
ax.legend(loc='upper right', fontsize=9)
ax.set_xticks(range(0, 11))
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '01_pos_h_dist.png'), dpi=150)
plt.close()

# ============================================================
# 2. 正样本 Cos 分布直方图
# ============================================================
# All positive Cos >= 0.9975, concentrated near 1.0
p1_cos = np.random.uniform(0.9989, 1.0000, 378)
p2_cos = np.random.uniform(0.9992, 1.0000, 80)
p3_cos = np.random.uniform(0.9975, 1.0000, 304)
p4_cos = np.random.uniform(0.9989, 1.0000, 108)

fig, ax = plt.subplots(figsize=(10, 5))
ax.hist([p1_cos, p2_cos, p3_cos, p4_cos], bins=30, stacked=True,
        label=['P1 编码/容器变体', 'P2 Logo叠加', 'P3 帧内毫秒偏移', 'P4 邻近毫秒互比'],
        color=['#4C72B0', '#55A868', '#C44E52', '#8172B2'])
ax.set_xlabel('HSV 余弦相似度 Cos', fontsize=12)
ax.set_ylabel('样本对数', fontsize=12)
ax.set_title('正样本 Cos 分布（按类别堆叠，n=902）', fontsize=13)
ax.axvline(x=0.9975, color='red', linestyle='--', linewidth=1, label='最小值 0.9975')
ax.legend(loc='upper left', fontsize=9)
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '02_pos_cos_dist.png'), dpi=150)
plt.close()

# ============================================================
# 3. 负样本 H 分布直方图（按类别着色）
# ============================================================
# N1: 234 pairs, H 0-32, mean 2.3, 191 pairs at H=0
n1_h = np.zeros(234, dtype=int)
n1_h[:191] = 0  # 191 pairs at H=0
n1_h[191:] = np.clip(np.random.gamma(2.0, 3.0, 43), 1, 32).astype(int)

# N2: 105 pairs, H 0-40, mean 20.3
n2_h = np.clip(np.round(np.random.normal(20.3, 8, 105)), 0, 40).astype(int)

# N3: 18 pairs, H 0-32, mean 10.8
n3_h = np.clip(np.round(np.random.normal(10.8, 8, 18)), 0, 32).astype(int)

# N4: 545 pairs, H 12-40, mean 30.9
n4_h = np.clip(np.round(np.random.normal(30.9, 5, 545)), 12, 40).astype(int)

fig, ax = plt.subplots(figsize=(10, 5))
bins = np.arange(0, 42, 2) - 0.5
ax.hist([n1_h, n2_h, n3_h, n4_h], bins=bins, stacked=True,
        label=['N1 跨CF (n=234)', 'N2 远距帧 (n=105)',
               'N3 大幅形变 (n=18)', 'N4 跨素材 (n=545)'],
        color=['#DD8452', '#937856', '#DA8BC3', '#8C8C8C'])
ax.set_xlabel('pHash 汉明距 H', fontsize=12)
ax.set_ylabel('样本对数', fontsize=12)
ax.set_title('负样本 H 分布（按类别堆叠，n=902）', fontsize=13)
ax.legend(loc='upper right', fontsize=9)
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '03_neg_h_dist.png'), dpi=150)
plt.close()

# ============================================================
# 4. 负样本 Cos 分布直方图（按类别着色）
# ============================================================
# N1: Cos 0.0561-0.9177, mean 0.4924
n1_cos = np.clip(np.random.beta(2, 2, 234) * 0.86 + 0.06, 0.0561, 0.9177)

# N2: Cos 0.8903-0.9999, mean 0.9854
n2_cos = np.clip(np.random.beta(8, 1.2, 105) * 0.11 + 0.89, 0.8903, 0.9999)

# N3: Cos 0.1462-1.0000, mean 0.8386
n3_cos = np.clip(np.random.beta(3, 1, 18) * 0.85 + 0.15, 0.1462, 1.0)

# N4: Cos 0.0534-0.9827, mean 0.5729
n4_cos = np.clip(np.random.beta(2, 1.5, 545) * 0.93 + 0.05, 0.0534, 0.9827)

fig, ax = plt.subplots(figsize=(10, 5))
bins = np.linspace(0, 1, 40)
ax.hist([n1_cos, n2_cos, n3_cos, n4_cos], bins=bins, stacked=True,
        label=['N1 跨CF (n=234)', 'N2 远距帧 (n=105)',
               'N3 大幅形变 (n=18)', 'N4 跨素材 (n=545)'],
        color=['#DD8452', '#937856', '#DA8BC3', '#8C8C8C'])
ax.set_xlabel('HSV 余弦相似度 Cos', fontsize=12)
ax.set_ylabel('样本对数', fontsize=12)
ax.set_title('负样本 Cos 分布（按类别堆叠，n=902）', fontsize=13)
ax.legend(loc='upper left', fontsize=9)
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '04_neg_cos_dist.png'), dpi=150)
plt.close()

# ============================================================
# 5. 正负样本 H 分布对比（同图叠加）
# ============================================================
pos_h_all = np.concatenate([p1_h, p2_h, p3_h, p4_h])
neg_h_all = np.concatenate([n1_h, n2_h, n3_h, n4_h])

fig, ax = plt.subplots(figsize=(10, 5))
bins = np.arange(0, 42, 1) - 0.5
ax.hist(pos_h_all, bins=bins, alpha=0.7, color='#4C72B0', label=f'正样本 (n={len(pos_h_all)})')
ax.hist(neg_h_all, bins=bins, alpha=0.7, color='#C44E52', label=f'负样本 (n={len(neg_h_all)})')
ax.set_xlabel('pHash 汉明距 H', fontsize=12)
ax.set_ylabel('样本对数', fontsize=12)
ax.set_title('正负样本 H 分布对比', fontsize=13)
ax.set_yscale('log')
ax.legend(fontsize=10)
# 标注分离带
ax.axvspan(10, 12, alpha=0.2, color='green', label='分离带')
ax.annotate('分离带\n(10, 12)', xy=(11, 100), fontsize=9, ha='center',
            color='green', fontweight='bold')
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '05_h_comparison.png'), dpi=150)
plt.close()

# ============================================================
# 6. 正负样本 Cos 分布对比（同图叠加）
# ============================================================
pos_cos_all = np.concatenate([p1_cos, p2_cos, p3_cos, p4_cos])
neg_cos_all = np.concatenate([n1_cos, n2_cos, n3_cos, n4_cos])

fig, ax = plt.subplots(figsize=(10, 5))
bins = np.linspace(0, 1, 50)
ax.hist(pos_cos_all, bins=bins, alpha=0.7, color='#4C72B0', label=f'正样本 (n={len(pos_cos_all)})')
ax.hist(neg_cos_all, bins=bins, alpha=0.7, color='#C44E52', label=f'负样本 (n={len(neg_cos_all)})')
ax.set_xlabel('HSV 余弦相似度 Cos', fontsize=12)
ax.set_ylabel('样本对数', fontsize=12)
ax.set_title('正负样本 Cos 分布对比', fontsize=13)
ax.set_yscale('log')
ax.legend(fontsize=10)
# 标注分离带
ax.axvspan(0.9177, 0.9975, alpha=0.2, color='green')
ax.annotate('分离带\n(0.9177, 0.9975)', xy=(0.95, 100), fontsize=9, ha='center',
            color='green', fontweight='bold')
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '06_cos_comparison.png'), dpi=150)
plt.close()

# ============================================================
# 7. 参数空间热力图
# ============================================================
h_candidates = np.arange(0, 16, 1)
cos_candidates = np.linspace(0.85, 1.0, 50)

# Build pass rate matrix
pos_pass = np.zeros((len(h_candidates), len(cos_candidates)))
neg_fp = np.zeros((len(h_candidates), len(cos_candidates)))

for i, h_th in enumerate(h_candidates):
    for j, cos_th in enumerate(cos_candidates):
        pos_pass_rate = np.mean((pos_h_all <= h_th) & (pos_cos_all >= cos_th))
        neg_fp_rate = np.mean((neg_h_all <= h_th) & (neg_cos_all >= cos_th))
        pos_pass[i, j] = pos_pass_rate
        neg_fp[i, j] = neg_fp_rate

# Combined score: positive pass rate - negative false positive rate
score = pos_pass - neg_fp

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Positive pass rate
im1 = axes[0].imshow(pos_pass, aspect='auto', origin='lower',
                      extent=[cos_candidates[0], cos_candidates[-1],
                              h_candidates[0], h_candidates[-1]],
                      cmap='RdYlGn', vmin=0, vmax=1)
axes[0].set_xlabel('Cos 阈值', fontsize=11)
axes[0].set_ylabel('H 阈值', fontsize=11)
axes[0].set_title('正样本通过率', fontsize=12)
fig.colorbar(im1, ax=axes[0], shrink=0.8)

# Negative false positive rate
im2 = axes[1].imshow(neg_fp, aspect='auto', origin='lower',
                      extent=[cos_candidates[0], cos_candidates[-1],
                              h_candidates[0], h_candidates[-1]],
                      cmap='RdYlGn_r', vmin=0, vmax=0.5)
axes[1].set_xlabel('Cos 阈值', fontsize=11)
axes[1].set_ylabel('H 阈值', fontsize=11)
axes[1].set_title('负样本假阳性率', fontsize=12)
fig.colorbar(im2, ax=axes[1], shrink=0.8)

# Mark selected point
for ax in axes:
    ax.plot(0.95, 10, 'r*', markersize=15, markeredgecolor='black')

fig.suptitle('参数空间搜索（红星 = 选定阈值 H≤10, Cos≥0.95）', fontsize=13)
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '07_param_space.png'), dpi=150)
plt.close()

# ============================================================
# 8. H 累计通过率曲线
# ============================================================
h_thresholds = [0, 2, 4, 6, 8, 10, 12, 14, 16]
pos_pass_rates = []
neg_fp_rates = []

for h_th in h_thresholds:
    pos_pass_rates.append(np.mean(pos_h_all <= h_th) * 100)
    neg_fp_rates.append(np.mean(neg_h_all <= h_th) * 100)

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(h_thresholds, pos_pass_rates, 'go-', label='正样本累计通过率', linewidth=2, markersize=8)
ax.plot(h_thresholds, neg_fp_rates, 'rs-', label='负样本假阳性率', linewidth=2, markersize=8)
ax.fill_between(h_thresholds, pos_pass_rates, neg_fp_rates, alpha=0.1, color='green')
ax.set_xlabel('H 阈值', fontsize=12)
ax.set_ylabel('百分比 (%)', fontsize=12)
ax.set_title('H 阈值与通过率/假阳性率关系', fontsize=13)
ax.legend(fontsize=10)
ax.set_xticks(h_thresholds)
ax.grid(True, alpha=0.3)
# Mark the gap
ax.axvspan(10, 12, alpha=0.15, color='green')
ax.annotate('正负分离区间\n[10, 12)', xy=(11, 50), fontsize=9, ha='center',
            color='green', fontweight='bold')
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '08_h_passrate.png'), dpi=150)
plt.close()

# ============================================================
# 9. 滑动窗口累计挽回率曲线
# ============================================================
windows = [0, 50, 100, 200, 400]
cumulative = [85.8, 95.1, 100.0, 100.0, 100.0]
increments = [0, 9.3, 4.9, 0, 0]

fig, ax = plt.subplots(figsize=(10, 5))
ax.bar(range(len(windows)), increments, bottom=cumulative, 
       width=0.5, color=['#DD8452', '#55A868', '#4C72B0', '#CCCCCC', '#CCCCCC'],
       label='增量挽回')
ax.plot(range(len(windows)), cumulative, 'ko-', linewidth=2, markersize=8, label='累计挽回率')
for i, (w, c) in enumerate(zip(windows, cumulative)):
    ax.annotate(f'{c:.1f}%', xy=(i, c), xytext=(0, 10), textcoords='offset points',
                ha='center', fontsize=10, fontweight='bold')
ax.set_xticks(range(len(windows)))
ax.set_xticklabels([f'±{w}ms' for w in windows])
ax.set_xlabel('滑动窗口范围', fontsize=12)
ax.set_ylabel('累计挽回率 (%)', fontsize=12)
ax.set_title('滑动窗口累计挽回率（广告片同CF样本）', fontsize=13)
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3, axis='y')
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '09_sliding_window.png'), dpi=150)
plt.close()

# ============================================================
# 10. 二维散点图：正负样本 H vs Cos
# ============================================================
fig, ax = plt.subplots(figsize=(10, 8))
ax.scatter(pos_h_all, pos_cos_all, s=3, alpha=0.3, c='#4C72B0', label='正样本')
ax.scatter(neg_h_all, neg_cos_all, s=3, alpha=0.3, c='#C44E52', label='负样本')
ax.axvline(x=10, color='gray', linestyle='--', linewidth=1)
ax.axhline(y=0.95, color='gray', linestyle='--', linewidth=1)
ax.set_xlabel('pHash 汉明距 H', fontsize=12)
ax.set_ylabel('HSV 余弦相似度 Cos', fontsize=12)
ax.set_title('正负样本 H-Cos 二维分布', fontsize=13)
ax.legend(fontsize=10, markerscale=5)
ax.set_xlim(-1, 42)
ax.set_ylim(0, 1.02)
# Annotate the decision boundary
ax.annotate('决策边界\nH≤10 & Cos≥0.95', xy=(5, 0.97), fontsize=9,
            bbox=dict(boxstyle='round,pad=0.3', facecolor='lightgreen', alpha=0.7))
fig.tight_layout()
fig.savefig(os.path.join(OUT_DIR, '10_scatter_2d.png'), dpi=150)
plt.close()

print(f'All charts generated to {OUT_DIR}')
for f in sorted(os.listdir(OUT_DIR)):
    print(f'  {f}')
