#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 正在启动肌肉神话赛事管理系统 (MMCMS)...${NC}"

# 1. 清理旧进程
echo -e "${BLUE}🧹 清理端口占用 (3000, 4000)...${NC}"
fuser -k 3000/tcp > /dev/null 2>&1
fuser -k 4000/tcp > /dev/null 2>&1

# 2. 检查并启动数据库
echo -e "${BLUE}🗄️  检查数据库...${NC}"
if ! docker ps | grep -q mongodb; then
    if docker ps -a | grep -q mongodb; then
        echo -e "${GREEN}启动现有的 MongoDB 容器...${NC}"
        docker start mongodb
    else
        echo -e "${GREEN}创建并启动新的 MongoDB 容器...${NC}"
        docker run -d -p 27017:27017 --name mongodb mongo:8.0
    fi
else
    echo -e "${GREEN}MongoDB 正在运行${NC}"
fi

# 3. 检查依赖 (快速检查)
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 检测到依赖缺失，正在安装...${NC}"
    pnpm install
fi

# 4. 清理 Next.js 缓存 (解决模块找不到的问题)
echo -e "${BLUE}🧹 清理前端缓存...${NC}"
rm -rf frontend/.next

# 5. 启动服务
echo -e "${BLUE}🔥 正在启动前后端服务...${NC}"
# 使用 pnpm 的并行执行，不依赖 concurrently
pnpm dev &
PID=$!

# 6. 等待服务就绪并打开浏览器
echo -e "${BLUE}⏳ 等待服务就绪...${NC}"
MAX_RETRIES=30
COUNT=0

while [ $COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ 服务已就绪!${NC}"
        echo -e "${GREEN}🌍 正在打开浏览器...${NC}"
        
        # 尝试打开浏览器 (Linux/Ubuntu)
        if command -v xdg-open > /dev/null; then
            xdg-open http://localhost:3000
        elif command -v gnome-open > /dev/null; then
            gnome-open http://localhost:3000
        else
            echo -e "${RED}无法自动打开浏览器，请手动访问: http://localhost:3000${NC}"
        fi
        break
    fi
    
    # 检查进程是否还在运行
    if ! kill -0 $PID 2>/dev/null; then
        echo -e "${RED}❌ 启动失败，进程已退出。请检查日志。${NC}"
        exit 1
    fi
    
    sleep 2
    COUNT=$((COUNT+1))
    echo -n "."
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo -e "\n${RED}❌ 启动超时。请检查终端输出的错误信息。${NC}"
fi

# 保持脚本运行以显示日志
wait $PID
