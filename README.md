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
- Deployed on Vercel

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
