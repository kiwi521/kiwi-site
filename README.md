# kiwi-site

A React + Vite personal website for **kiwi** — redesigned as a more immersive, cinematic homepage while still centering kiwi’s photography learning notes, visual observations, and personal links.

## Live Site

- Website: [kiwiwang.online](https://kiwiwang.online)
- GitHub: [kiwi521/kiwi-site](https://github.com/kiwi521/kiwi-site)

## About

This version keeps the original personal-homepage intent, but rebuilds the experience with a stronger hero section, layered imagery, motion, and a more editorial visual rhythm.

The site is designed to quickly communicate:

- who kiwi is
- what kiwi is learning and documenting through photography
- where to keep following the archive as it expands

## Visual Direction

The redesign blends:

- dark cinematic presentation
- premium editorial typography
- layered image storytelling
- soft motion and atmospheric transitions

The homepage now draws from a prompt-led hero concept while adapting all core content back to kiwi’s own identity and links.

## Links

- Xiaohongshu: <https://www.xiaohongshu.com/user/profile/5c4fa81a0000000010027712?xsec_token=YBuHV1H2q_hFsov_4fylWMCc_NJBsMJyzK-TRfVwRx9fU%3D&xsec_source=app_share&xhsshare=&shareRedId=N0k2RkQ9NUo2NzUyOTgwNjczOTk7PDc7&apptime=1782655112&share_id=46ea4f6245864970bbcaab4f69f3f995&share_channel=copy_link>
- 500px / 视觉中国: <https://500px.com.cn/kiwiberry>
- Netease Music: <https://music.163.com/#/user/home?id=1501816384>

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- lucide-react
- Vercel Serverless Functions
- MySQL
- Deployed on Vercel

## Notes Backend

摄影笔记通过 `api/notes.ts` 读写 MySQL，不再依赖浏览器 localStorage。接口支持：

- `GET /api/notes`：读取最近 50 条笔记
- `POST /api/notes`：创建笔记，支持标题、正文和一张图片
- `DELETE /api/notes?id=1`：删除笔记

先在 MySQL 中执行 [`database/schema.sql`](database/schema.sql) 创建数据表。然后在 Vercel 项目设置中配置以下环境变量：

```text
MYSQL_HOST=你的数据库主机
MYSQL_PORT=3306
MYSQL_USER=你的数据库用户名
MYSQL_PASSWORD=你的数据库密码
MYSQL_DATABASE=你的数据库名
MYSQL_SSL=true
NOTES_ADMIN_TOKEN=发布和删除笔记的管理员密码
```

也可以使用单条连接串：

```text
MYSQL_URL=mysql://用户名:密码@主机:3306/数据库名
```

还需要设置 `NOTES_ADMIN_TOKEN`。页面发布区输入同样的密码后，才能发布或删除笔记；访客只能读取公开笔记。

`MYSQL_URL` 优先级高于分开的连接参数。上传原文件最大 5MB，支持 JPG、PNG、WebP、HEIC 和 HEIF；HEIC/HEIF 会在浏览器端转换为 JPEG，并生成展示图与缩略图。摄影笔记列表使用缩略图懒加载，点击照片可查看高清展示图。图片目前以压缩后的 Base64 写入 MySQL；如果笔记量或图片量增长，建议把图片迁移到对象存储，只在 MySQL 保存图片地址。

如果数据库表是在图片缩略图功能加入前创建的，请继续执行 [`database/migration-add-image-thumbnail.sql`](database/migration-add-image-thumbnail.sql)，为 `photo_notes` 增加 `image_thumbnail` 字段。

本地执行 `npm run dev` 只能预览 Vite 前端，`/api/notes` 需要部署到 Vercel 后才能连接数据库。部署前必须先配置 Vercel 的环境变量，并在目标 MySQL 中执行建表 SQL。

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Project Structure

```text
.
├─ assets/
├─ src/
│  ├─ App.tsx
│  ├─ api/
│  ├─ components/
│  ├─ pages/
│  ├─ types/
│  └─ utils/
│  ├─ index.css
│  └─ main.tsx
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts
```

## Deployment

This repository is connected to Vercel.

Typical update flow:

```bash
git add .
git commit -m "Update site"
git push origin main
```

Pushing to `main` should trigger a new Vercel deployment automatically.
