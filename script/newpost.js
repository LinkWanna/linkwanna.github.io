import path from 'path';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 获取命令行参数
const articleName = process.argv.slice(2).join('');
const articleID = crypto.createHash('sha256').update(dayjs().valueOf().toString()).digest('hex').slice(0, 16);
if (!articleName) {
  console.error('请提供文章名称，例如：pnpm newpost "第一篇文章"');
  process.exit(1);
}
const ArticleContent = `---
title: "${articleName.replace(/"/g, '\\"')}"
categories: 分类
tags: ['标签']
id: "${articleID.slice(0, 16)}"
date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}
cover: "封面图URL (为空默认随机内置封面 /assets/images/banner)"
---

:::note
文章描述
:::

### 标题1

::btn[按钮]{link="链接" type="info"}`;
const init = async () => {
  // 写文件
  const now = dayjs();
  const targetDir = path.join(__dirname, '../src/content/blog', `${now.year()}/${now.format('MM')}`);
  try {
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, `${articleName}.md`), ArticleContent, 'utf8');
    const filePath = path.join(targetDir, `${articleName}.md`);
    await fs.writeFile(path.join(targetDir, `${articleName}.md`), ArticleContent, 'utf8');
    // 友好输出
    console.log('✅ 文章创建成功');
    console.log(`📅 日期：${now.format('YYYY-MM-DD')}`);
    console.log(`📂 路径：${filePath}`);
    console.log(`🆔 ID：${articleID.slice(0, 16)} (可手动修改)`);
  } catch (error) {
    // 增强错误处理
    console.error('❌ 创建失败：');
    console.error(`错误类型：${error.code || 'UNKNOWN_ERROR'}`);
    console.error(`详细信息：${error.message}`);
    process.exit(1);
  }
}
init();