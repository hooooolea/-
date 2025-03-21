from pulp import LpMaximize, LpProblem, LpVariable

# 定义线性规划问题
prob = LpProblem("Optimal_Route", LpMaximize)

# 定义决策变量
x = LpVariable.dicts('x', [(i,j) for i in range(1,4) for j in range(1,4)], cat='Binary')

# 参数设置
max_time = 10  # 最大允许时间
max_distance = 300  # 最大允许距离
time_values = {1:2, 2:3, 3:1}  # 各节点时间消耗
distance_matrix = {
    (1,2):50, (1,3):80,
    (2,1):60, (2,3):70,
    (3,1):90, (3,2):65
}

# 目标函数：最大化路径节点数
prob += sum(x[i,j] for i in range(1,4) for j in range(1,4))

# 约束条件
# 1. 路径连续性约束
for j in range(1,4):
    prob += sum(x[i,j] for i in range(1,4) if i != j) == sum(x[j,k] for k in range(1,4) if k != j)

# 2. 起点约束
prob += sum(x[1,j] for j in range(2,4)) == 1

# 3. 时间约束
prob += sum(time_values[i]*x[i,j] for i in range(1,4) for j in range(1,4) if i != j) <= max_time

# 4. 距离约束
prob += sum(distance_matrix[(i,j)]*x[i,j] for i,j in distance_matrix) <= max_distance

# 求解问题
prob.solve()

# 输出结果
print("最优路径包含节点数:", int(sum(x[i,j].varValue for i,j in x)))
print("各路段选择情况:")
for (i,j),var in x.items():
    if var.varValue > 0:
        print(f"从节点{i}到节点{j}")