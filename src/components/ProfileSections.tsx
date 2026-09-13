import { ArrowUpRight } from 'lucide-react'

const socialLinks = [
  {
    label: '小红书',
    description: '日常更新与短笔记',
    href: 'https://www.xiaohongshu.com/user/profile/5c4fa81a0000000010027712?xsec_token=YBuHV1H2q_hFsov_4fylWMCc_NJBsMJyzK-TRfVwRx9fU%3D&xsec_source=app_share&xhsshare=&shareRedId=N0k2RkQ9NUo2NzUyOTgwNjczOTk7PDc7&apptime=1782655112&share_id=46ea4f6245864970bbcaab4f69f3f995&share_channel=copy_link',
  },
  { label: '500px / 视觉中国', description: '作品归档', href: 'https://500px.com.cn/kiwiberry' },
  { label: '网易云音乐', description: '拍照时在听的歌', href: 'https://music.163.com/#/user/home?id=1501816384' },
]

const storyCards = [
  {
    eyebrow: '我是谁',
    title: '一个把摄影当作长期练习的人。',
    body: '我喜欢走路、观察光线，也喜欢把那些一闪而过的感受留下来。这里是我的个人主页，也是我慢慢建立起来的视觉档案。',
  },
  {
    eyebrow: '我在记录什么',
    title: '构图、光线、颜色，还有当时为什么想拍下来。',
    body: '比起展示结果，我更想记录一张照片是怎么被看见的。偶尔写一点心得，偶尔分享一张还在练习中的照片。',
  },
  {
    eyebrow: '在这里继续看',
    title: '如果你也喜欢慢一点看世界，欢迎留下来。',
    body: '你可以从摄影笔记开始，也可以去外部平台看看更完整的作品和日常更新。',
  },
]

export function ProfileIntro() {
  return (
    <section id="about" className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10 lg:p-12">
        <p className="mb-4 text-xs tracking-[0.2em] text-white/45">关于这页主页</p>
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-5xl">这是 kiwi 的个人摄影主页，也是一份还在写的视觉手记。</h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">我在这里记录构图、光线、颜色和那些让我想停下来看的片刻。没有固定的更新计划，想到什么就写一点，拍到喜欢的画面就留下来。</p>
      </div>

      <div className="rounded-[2rem] border border-[#e8702a]/20 bg-[#120c08] p-7 shadow-[0_30px_100px_rgba(232,112,42,0.18)] sm:p-10 lg:p-12">
        <p className="mb-4 text-xs tracking-[0.2em] text-[#f0b38d]">在别处找到我</p>
        <div className="space-y-3">
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-all hover:border-white/20 hover:bg-white/10">
              <span><span className="block text-sm text-white/90">{link.label}</span><span className="mt-1 block text-xs text-white/45">{link.description}</span></span>
              <ArrowUpRight className="text-white/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" size={17} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProfileFooter() {
  return (
    <>
      <section className="mx-auto mt-20 grid max-w-6xl gap-6 md:grid-cols-3">
        {storyCards.map((card, index) => (
          <article key={card.eyebrow} className={index === 1 ? 'rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:translate-y-8' : 'rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]'}>
            <p className="mb-4 text-xs tracking-[0.2em] text-white/45">{card.eyebrow}</p>
            <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-white">{card.title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/65">{card.body}</p>
          </article>
        ))}
      </section>

      <footer className="mx-auto mt-24 flex max-w-6xl flex-col gap-7 border-t border-white/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-playfair text-2xl italic text-white">kiwi</p><p className="mt-2 text-sm text-white/45">把喜欢的光线和生活，慢慢记录下来。</p></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
          {socialLinks.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">{link.label}</a>)}
        </div>
      </footer>
    </>
  )
}
