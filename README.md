# 肌肉神话健美比赛管理系统 (Muscle Myths CMS)

这是肌肉神话健美比赛的官方管理系统。
严格按照 SRS 文档要求，采用“激进技术策略 (Bleeding Edge)”构建。

## 技术栈

- **前端:** Next.js 16 (App Router), React 19, TailwindCSS 4, Shadcn/ui, Zustand.
- **后端:** Node.js 25, Express 5, Mongoose 8, MongoDB 8.
- **DevOps:** Docker, pnpm.

## 环境要求

- Node.js 23+ (本系统开发环境使用 v25)
- pnpm 9+
- Docker (用于运行 MongoDB)

## 快速开始

1.  **启动数据库:**
    ```bash
    # 启动 MongoDB 8.0 容器
    sudo docker run -d -p 27017:27017 --name mongodb mongo:8.0
    ```

2.  **安装依赖:**
    ```bash
    pnpm install
    ```

3.  **初始化超级管理员 (仅首次运行):**
    ```bash
    cd backend
    npx tsx src/seed.ts
    # 默认 Token: muscle_myths_super_secret_2025
    # 默认用户: superadmin / 密码: password123
    ```

4.  **一键启动开发服务器:**
    ```bash
    # 在项目根目录执行
    ./start.sh
    # 或者
    pnpm dev
    ```
    这将同时启动：
    - 后端: Port 4000
    - 前端: Port 3000

5.  **访问系统:**
    打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 已实现功能 (MVP 第一阶段)

- [x] **认证系统:** 支持密码登录或超级管理员 Token 登录。
- [x] **选手管理:** 创建和查看选手列表。
- [x] **赛事管理:** 创建和查看赛事列表。
- [x] **报名管理:** 为选手报名参赛，自动计算费用，动态加载三级组别。
- [x] **秩序表生成:** 基于报名信息自动生成秩序表。
- [x] **计分系统:** 提交分数并自动计算排名（去极值算法）。
- [x] **数据模型:** 完整的 User, Athlete, Event, Registration, Score, Lineup 模型实现。

## 下一步计划

1.  前端秩序表的可视化拖拽排序。
2.  完善裁判打分的前端界面。
3.  数据可视化大屏。
