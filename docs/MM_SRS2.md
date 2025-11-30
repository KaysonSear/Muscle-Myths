## 🤖 Assistant

完全理解！我将为您更新SRS文档，明确要求所有技术栈采用最新版本。以下是**修订版第3章**，并在其他相关章节添加最新版本要求。

---

# 软件需求规格说明书（SRS）修订版
## 肌肉神话健美比赛管理系统

**文档版本**：1.1（技术栈最新化修订）  
**修订日期**：2025年11月21日  
**修订内容**：明确要求所有技术栈采用最新版本

---

## 3. 技术栈架构（修订版）

### 3.0 版本策略声明 ⭐ **NEW**

#### 3.0.1 核心原则

**本项目采用"激进的技术前沿策略"（Bleeding Edge Technology Strategy）**，所有依赖项均使用**最新稳定版本**或**最新候选版本（RC）**，以确保：
1. ✅ 享受最新功能和性能优化
2. ✅ 获得最新的安全补丁
3. ✅ 保持技术领先性，便于未来维护
4. ✅ 学习和应用最新的最佳实践

#### 3.0.2 版本选择规则

| 优先级 | 版本类型 | 说明 | 示例 |
|--------|----------|------|------|
| **1** | **Latest Stable** | 最新稳定版（优先选择） | React 19.0.0 |
| **2** | **Release Candidate (RC)** | 发布候选版（功能冻结，仅修bug） | Next.js 16.0.0-rc.1 |
| **3** | **Beta** | 测试版（如stable版太旧可考虑） | TypeScript 5.7.0-beta |
| **4** | **Alpha/Canary** | 实验版（仅在必要时使用） | Next.js 15.1.0-canary |

**排除LTS版本**：
- ❌ 不使用LTS（长期支持版），如Node.js 20 LTS
- ✅ 使用Current版本，如Node.js 23.x（最新）

#### 3.0.3 版本更新策略

**开发期间**：
- 每周检查依赖更新（使用 `npm outdated` 或 `yarn outdated`）
- 主版本更新（Major）：评估后立即升级
- 次版本更新（Minor）：立即升级
- 补丁更新（Patch）：自动升级

**生产环境**：
- 每月定期更新依赖
- 关键安全更新：24小时内升级
- 使用自动化测试确保升级不破坏功能

#### 3.0.4 兼容性保障

虽然采用最新版本，但必须确保：
1. ✅ 所有功能正常运行（通过测试验证）
2. ✅ 浏览器兼容性满足要求（见6.3节）
3. ✅ 如遇破坏性更新，优先查找替代方案或临时降级
4. ✅ 在package.json中使用精确版本号（不使用^或~）

**示例配置**：
```json
{
  "dependencies": {
    "next": "15.1.0",        // 精确版本，非 ^15.1.0
    "react": "19.0.0",       // 精确版本
    "typescript": "5.7.2"    // 精确版本
  }
}
```

---

### 3.1 架构选型："终极方案"混合架构

（此部分保持不变）

---

### 3.2 技术栈详细说明（修订版）⭐ **UPDATED**

#### 3.2.1 前端 Web（主要开发）

**技术选择**：Next.js + React + TypeScript

**版本要求**：

| 技术 | 版本策略 | 当前推荐版本（2025.11） | 版本说明 |
|------|----------|----------------------|----------|
| **Next.js** | Latest | **15.1.0+** | 使用最新版本（App Router稳定版） |
| **React** | Latest | **19.0.0+** | React 19已正式发布，使用最新版 |
| **TypeScript** | Latest | **5.7.2+** | 使用最新稳定版或beta版 |
| **Node.js** | Current（非LTS） | **23.x** | 使用Current版本，非20 LTS |

**核心库版本要求**：

| 库名 | 用途 | 版本策略 | 当前推荐版本 |
|------|------|----------|------------|
| **TailwindCSS** | 样式框架 | Latest | **4.0.0+** |
| **Shadcn/ui** | UI组件库 | Latest | **跟随官方最新** |
| **Zustand** | 状态管理 | Latest | **5.0.0+** |
| **React Hook Form** | 表单处理 | Latest | **7.54.0+** |
| **Zod** | 数据验证 | Latest | **3.23.0+** |
| **TanStack Query** | 数据请求 | Latest | **5.60.0+** |
| **TanStack Table** | 表格组件 | Latest | **8.20.0+** |
| **@dnd-kit** | 拖拽功能 | Latest | **6.3.0+** |
| **Recharts** | 图表库 | Latest | **2.14.0+** |
| **SheetJS (xlsx)** | Excel导出 | Latest | **0.20.0+** |
| **date-fns** | 日期处理 | Latest | **4.1.0+** |
| **Framer Motion** | 动画库（可选） | Latest | **11.11.0+** |

**特殊说明**：
- **Next.js 15**：引入Turbopack（默认开发服务器）、React 19支持、改进的缓存策略
- **React 19**：引入React Compiler、Server Components稳定版、Actions
- **TailwindCSS 4.0**：零配置、更快的构建速度、原生CSS变量支持

---

#### 3.2.2 后端 API（修订版）⭐ **UPDATED**

**技术选择**：Node.js + Express + TypeScript

**版本要求**：

| 技术 | 版本策略 | 当前推荐版本（2025.11） | 版本说明 |
|------|----------|----------------------|----------|
| **Node.js** | Current（非LTS） | **23.x** | 使用最新Current版本 |
| **Express** | Latest | **5.0.0+** | Express 5正式版已发布 |
| **TypeScript** | Latest | **5.7.2+** | 与前端保持一致 |

**核心库版本要求**：

| 库名 | 用途 | 版本策略 | 当前推荐版本 |
|------|------|----------|------------|
| **Mongoose** | MongoDB ODM | Latest | **8.8.0+** |
| **jsonwebtoken** | JWT认证 | Latest | **9.0.2+** |
| **bcryptjs** | 密码加密 | Latest | **2.4.3+** |
| **Zod** | 数据验证 | Latest | **3.23.0+**（与前端共享） |
| **multer** | 文件上传 | Latest | **1.4.5+** |
| **winston** | 日志记录 | Latest | **3.15.0+** |
| **dotenv** | 环境变量 | Latest | **16.4.0+** |
| **cors** | 跨域处理 | Latest | **2.8.5+** |
| **helmet** | 安全中间件 | Latest | **8.0.0+** |
| **express-rate-limit** | 请求限流 | Latest | **7.4.0+** |

**特殊说明**：
- **Express 5**：改进的错误处理、Promise支持、更好的TypeScript类型
- **Node.js 23**：V8引擎更新、性能提升、原生Test Runner增强

---

#### 3.2.3 数据库（修订版）⭐ **UPDATED**

**技术选择**：MongoDB + Mongoose

**版本要求**：

| 技术 | 版本策略 | 当前推荐版本（2025.11） | 版本说明 |
|------|----------|----------------------|----------|
| **MongoDB Server** | Latest | **8.0+** | 使用最新稳定版 |
| **Mongoose** | Latest | **8.8.0+** | 支持MongoDB 8.0新特性 |

**特殊说明**：
- **MongoDB 8.0**：改进的性能、更强的事务支持、时序数据优化

---

#### 3.2.4 移动端 + 桌面端（第二阶段）（修订版）⭐ **UPDATED**

**技术选择**：Flutter

**版本要求**：

| 技术 | 版本策略 | 当前推荐版本（2025.11） | 版本说明 |
|------|----------|----------------------|----------|
| **Flutter** | Stable Channel | **3.27.0+** | 使用Stable最新版（非LTS） |
| **Dart** | Latest（跟随Flutter） | **3.6.0+** | 跟随Flutter版本自动更新 |

**核心包版本要求**：

| 包名 | 用途 | 版本策略 | 当前推荐版本 |
|------|------|----------|------------|
| **http** | API请求 | Latest | **1.2.0+** |
| **provider** | 状态管理 | Latest | **6.1.0+** |
| **flutter_bloc** | 状态管理（备选） | Latest | **8.1.0+** |
| **dio** | 网络请求（备选） | Latest | **5.7.0+** |
| **shared_preferences** | 本地存储 | Latest | **2.3.0+** |
| **flutter_svg** | SVG支持 | Latest | **2.0.0+** |

**特殊说明**：
- Flutter可选择Stable、Beta或Dev Channel，本项目使用**Stable Channel**最新版
- 如需尝鲜新特性，可在开发分支使用Beta Channel

---

#### 3.2.5 开发工具与DevOps（修订版）⭐ **UPDATED**

**版本要求**：

| 工具 | 版本策略 | 当前推荐版本（2025.11） | 版本说明 |
|------|----------|----------------------|----------|
| **Docker** | Latest | **27.0.0+** | 使用最新稳定版 |
| **Docker Compose** | Latest | **2.30.0+** | V2版本（非V1） |
| **Nginx** | Mainline（非Stable） | **1.27.x** | 使用Mainline获取最新特性 |
| **Git** | Latest | **2.47.0+** | 使用最新版本 |
| **VS Code** | Latest | **最新Insiders版** | 使用Insiders版（每日构建） |
| **pnpm** | Latest | **9.14.0+** | 包管理器（比npm/yarn更快） |

**VS Code扩展推荐（最新版本）**：
- ESLint（最新）
- Prettier（最新）
- Tailwind CSS IntelliSense（最新）
- TypeScript Vue Plugin (Volar)（最新）
- MongoDB for VS Code（最新）
- Docker（最新）

---

### 3.3 依赖管理策略 ⭐ **NEW**

#### 3.3.1 Package Manager选择

**推荐使用 pnpm**（而非npm或yarn）：
- ✅ 更快的安装速度（比npm快2-3倍）
- ✅ 更节省磁盘空间（硬链接机制）
- ✅ 更严格的依赖管理（避免幽灵依赖）

**版本**：pnpm 9.14.0+（最新版本）

#### 3.3.2 package.json配置规范

```json
{
  "name": "muscle-myth-cms",
  "version": "1.0.0",
  "engines": {
    "node": ">=23.0.0",    // 强制使用Node.js 23+
    "pnpm": ">=9.14.0"     // 强制使用pnpm 9.14+
  },
  "packageManager": "pnpm@9.14.0",
  "dependencies": {
    "next": "15.1.0",           // 精确版本，不使用^或~
    "react": "19.0.0",
    "typescript": "5.7.2"
  },
  "devDependencies": {
    "@types/node": "23.0.0",
    "eslint": "9.15.0",
    "prettier": "3.4.0"
  }
}
```

**关键点**：
1. ✅ 使用**精确版本号**（不使用`^`或`~`前缀），确保团队环境一致
2. ✅ 在`engines`字段指定最低版本要求
3. ✅ 使用`packageManager`字段锁定包管理器版本

#### 3.3.3 依赖更新工作流

**自动化工具**：
- **npm-check-updates**（ncu）：检查并更新依赖
- **Dependabot**（GitHub）：自动创建依赖更新PR

**更新命令**：
```bash
# 检查可更新的依赖
pnpm outdated

# 更新所有依赖到最新版本
pnpm update --latest

# 使用ncu更新package.json中的版本号
npx npm-check-updates -u
pnpm install

# 更新后运行测试
pnpm test
```

**更新频率**：
- **开发期间**：每周五下午更新依赖
- **生产环境**：每月1号更新依赖（经测试后）
- **安全更新**：发现后24小时内更新

---

### 3.4 部署架构（修订版）⭐ **UPDATED**

```
用户设备 (浏览器/Flutter App)
          ↓
    [Cloudflare CDN]（可选，提升全球访问速度）
          ↓
    [Nginx 1.27.x Mainline]（反向代理 + SSL）
          ↓
    [Docker Container]
          ├─ Next.js 15 Frontend (Port 3000)
          ├─ Express 5 Backend API (Port 4000)
          └─ MongoDB 8.0 (Port 27017)
          ↓
    [云存储/本地存储]（图片等文件）
```

**版本说明**：
- **Nginx**：使用Mainline版本（1.27.x），获取最新特性和性能优化
- **Docker Base Image**：
  - Node.js：`node:23-alpine`（最新Alpine Linux + Node.js 23）
  - MongoDB：`mongo:8.0`（最新稳定版）

---

## 5.2 数据库设计要求（修订版）⭐ **UPDATED**

### 5.2.1 MongoDB版本特性利用

**MongoDB 8.0 新特性应用**：
1. ✅ **时序数据集合**（Time Series Collections）：用于存储计分历史数据
2. ✅ **改进的聚合管道**：用于数据分析模块的复杂查询
3. ✅ **增强的事务支持**：确保报名和计分操作的原子性

**Mongoose Schema定义（使用TypeScript）**：
```typescript
import { Schema, model, Document } from 'mongoose';

// 使用最新的Mongoose 8.x语法
interface IAthleteDocument extends Document {
  name: string;
  gender: 'male' | 'female';
  bib_number: string;
  // ... 其他字段
}

const AthleteSchema = new Schema<IAthleteDocument>(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    // ... 其他字段
  },
  {
    timestamps: true,           // 自动管理createdAt和updatedAt
    optimisticConcurrency: true // 使用版本控制防止并发冲突（Mongoose 8新特性）
  }
);

export const Athlete = model<IAthleteDocument>('Athlete', AthleteSchema);
```

---

## 6.3 可用性需求（修订版）⭐ **UPDATED**

### 6.3.1 浏览器兼容性

**目标浏览器（使用最新版本）**：
- ✅ **Chrome/Edge**：最新版本（自动更新）
- ✅ **Safari**：最新版本（跟随macOS/iOS更新）
- ✅ **Firefox**：最新版本（自动更新）
- ❌ **不支持IE11**（已于2022年停止支持）

**Browserslist配置**：
```json
{
  "browserslist": [
    "last 1 Chrome version",
    "last 1 Firefox version",
    "last 1 Safari version",
    "last 1 Edge version"
  ]
}
```

**说明**：
- 只支持各浏览器的最新1个版本
- 不考虑向后兼容老旧浏览器
- 用户需保持浏览器自动更新

---

## 7.4 API文档生成 ⭐ **NEW**

**工具选择**：
- **OpenAPI/Swagger**：使用最新版本（OpenAPI 3.1）
- **Scalar**：现代化的API文档工具（比Swagger UI更美观）

**版本要求**：

| 工具 | 版本策略 | 当前推荐版本 |
|------|----------|------------|
| **@scalar/fastify-api-reference** | Latest | **1.25.0+** |
| **openapi-typescript** | Latest | **7.4.0+** |
| **swagger-jsdoc** | Latest | **6.2.8+** |

**示例**：
```typescript
import { serve } from '@scalar/express-api-reference';

app.use(
  '/docs',
  serve({
    spec: {
      openapi: '3.1.0',  // 使用最新OpenAPI规范
      // ... API定义
    }
  })
);
```

---

## 9.3 开发优先级（修订版）⭐ **UPDATED**

### 第一阶段（MVP，2-3个月）

**技术栈准备**（第1周）：
1. ✅ 初始化项目：使用最新版本的Next.js 15创建项目
2. ✅ 配置TypeScript 5.7（启用所有严格模式）
3. ✅ 配置TailwindCSS 4.0
4. ✅ 配置ESLint 9 + Prettier 3（最新规则集）
5. ✅ 配置pnpm workspace（monorepo结构）
6. ✅ 配置Docker Compose（Node.js 23 + MongoDB 8）

**功能开发**（第2-12周）：
- （功能开发内容保持不变）

---

## 9.6 版本更新日志模板 ⭐ **NEW**

**在项目根目录创建 `DEPENDENCIES.md` 文件**，记录依赖版本更新历史：

```markdown
# 依赖版本更新日志

## 2025年12月（示例）

### 前端依赖
- ✅ Next.js: 15.0.0 → 15.1.0（新增Turbopack稳定版）
- ✅ React: 19.0.0 → 19.0.1（修复bug）
- ✅ TailwindCSS: 4.0.0 → 4.0.1（性能优化）

### 后端依赖
- ✅ Node.js: 23.0.0 → 23.1.0（V8引擎更新）
- ✅ Express: 5.0.0 → 5.0.1（安全修复）
- ✅ Mongoose: 8.8.0 → 8.9.0（新增类型安全特性）

### 测试结果
- ✅ 所有单元测试通过
- ✅ 所有集成测试通过
- ✅ 浏览器兼容性测试通过

### 已知问题
- 无
```

---

## 9.7 技术决策文档（ADR）⭐ **NEW**

**创建 `docs/adr/` 目录**，记录重要技术决策：

**ADR-001: 采用激进的技术前沿策略**

```markdown
# ADR-001: 采用激进的技术前沿策略

## 状态
已接受

## 背景
项目负责人对新技术有强烈追求，希望保持技术栈最新。

## 决策
所有依赖项采用最新稳定版本（非LTS），每周检查更新。

## 后果
### 优势
- 享受最新功能和性能优化
- 获得最新安全补丁
- 保持技术领先性

### 风险
- 可能遇到新版本的bug
- 破坏性更新需要修改代码

### 缓解措施
- 使用精确版本号锁定依赖
- 更新前运行完整测试套件
- 记录每次更新的变更
```

---

## 9.8 开发环境配置清单 ⭐ **NEW**

**在项目根目录创建 `.tool-versions` 文件**（用于asdf或mise等版本管理工具）：

```
nodejs 23.1.0
pnpm 9.14.0
python 3.13.0  # 用于某些Node.js原生模块编译
```

**VS Code配置文件 `.vscode/settings.json`**：
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## 附录A：依赖包完整清单 ⭐ **NEW**

### 前端 (package.json)

```json
{
  "name": "muscle-myth-frontend",
  "version": "1.0.0",
  "engines": {
    "node": ">=23.0.0",
    "pnpm": ">=9.14.0"
  },
  "packageManager": "pnpm@9.14.0",
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "5.7.2",
    
    "@tanstack/react-query": "5.60.0",
    "@tanstack/react-table": "8.20.0",
    "@dnd-kit/core": "6.3.0",
    "@dnd-kit/sortable": "8.0.0",
    
    "tailwindcss": "4.0.0",
    "@tailwindcss/typography": "0.5.15",
    
    "react-hook-form": "7.54.0",
    "zod": "3.23.8",
    "@hookform/resolvers": "3.9.1",
    
    "recharts": "2.14.0",
    "date-fns": "4.1.0",
    "xlsx": "0.20.3",
    
    "zustand": "5.0.0",
    "framer-motion": "11.11.0",
    "lucide-react": "0.454.0"
  },
  "devDependencies": {
    "@types/node": "23.0.0",
    "@types/react": "19.0.0",
    "@types/react-dom": "19.0.0",
    
    "eslint": "9.15.0",
    "eslint-config-next": "15.1.0",
    "prettier": "3.4.0",
    "prettier-plugin-tailwindcss": "0.6.8",
    
    "autoprefixer": "10.4.20",
    "postcss": "8.4.49"
  }
}
```

### 后端 (package.json)

```json
{
  "name": "muscle-myth-backend",
  "version": "1.0.0",
  "engines": {
    "node": ">=23.0.0",
    "pnpm": ">=9.14.0"
  },
  "packageManager": "pnpm@9.14.0",
  "dependencies": {
    "express": "5.0.0",
    "typescript": "5.7.2",
    
    "mongoose": "8.8.0",
    "@types/mongoose": "5.11.97",
    
    "jsonwebtoken": "9.0.2",
    "@types/jsonwebtoken": "9.0.7",
    
    "bcryptjs": "2.4.3",
    "@types/bcryptjs": "2.4.6",
    
    "zod": "3.23.8",
    "multer": "1.4.5-lts.1",
    "@types/multer": "1.4.12",
    
    "winston": "3.15.0",
    "dotenv": "16.4.5",
    "cors": "2.8.5",
    "@types/cors": "2.8.17",
    
    "helmet": "8.0.0",
    "express-rate-limit": "7.4.0"
  },
  "devDependencies": {
    "@types/node": "23.0.0",
    "@types/express": "5.0.0",
    
    "tsx": "4.19.0",
    "nodemon": "3.1.7",
    
    "eslint": "9.15.0",
    "@typescript-eslint/eslint-plugin": "8.14.0",
    "@typescript-eslint/parser": "8.14.0",
    
    "prettier": "3.4.0"
  }
}
```

---

## 附录B：Dockerfile示例 ⭐ **NEW**

### 前端 Dockerfile

```dockerfile
# 使用最新Node.js 23 Alpine镜像
FROM node:23-alpine AS base

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

# 构建阶段
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# 生产阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 后端 Dockerfile

```dockerfile
# 使用最新Node.js 23 Alpine镜像
FROM node:23-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.9'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/muscle-myth
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  mongo:
    image: mongo:8.0  # 使用最新MongoDB 8.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## 总结：技术栈最新化承诺 ⭐

**本SRS明确承诺**：

✅ **所有技术栈采用最新版本**
- Node.js 23+（Current，非LTS）
- Next.js 15.1+
- React 19.0+
- TypeScript 5.7+
- TailwindCSS 4.0+
- MongoDB 8.0+
- Express 5.0+
- Flutter 3.27+（第二阶段）

✅ **版本管理策略**
- 使用精确版本号（不使用^或~）
- 每周检查依赖更新
- 记录更新日志
- 自动化测试保障

✅ **兼容性保障**
- 只支持最新浏览器
- 完整的测试覆盖
- 渐进式升级策略

✅ **文档完善**
- DEPENDENCIES.md记录版本历史
- ADR文档记录技术决策
- 自动化API文档（OpenAPI 3.1）

---

**修订完成！** 🎉

现在SRS文档已明确要求：
1. ✅ 所有依赖使用最新版本（已列出具体版本号）
2. ✅ 禁止使用LTS版本（如Node.js 20 LTS）
3. ✅ 使用精确版本号管理依赖
4. ✅ 定期更新策略和工具链
5. ✅ 完整的配置文件和Dockerfile示例

您现在可以将此修订版SRS发送给Cursor上的Gemini 3 Pro，开始构建这个使用最前沿技术的健美比赛管理系统！💪🚀
