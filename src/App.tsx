import { Menu } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'
const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85'
const SPOTLIGHT_R = 260

const navItems = ['主页导览', '摄影笔记', '观察记录', '练习计划', '持续更新']

const socialLinks = [
  {
    label: '小红书',
    href: 'https://www.xiaohongshu.com/user/profile/5c4fa81a0000000010027712?xsec_token=YBuHV1H2q_hFsov_4fylWMCc_NJBsMJyzK-TRfVwRx9fU%3D&xsec_source=app_share&xhsshare=&shareRedId=N0k2RkQ9NUo2NzUyOTgwNjczOTk7PDc7&apptime=1782655112&share_id=46ea4f6245864970bbcaab4f69f3f995&share_channel=copy_link',
  },
  { label: '500px / 视觉中国', href: 'https://500px.com.cn/kiwiberry' },
  { label: '网易云音乐', href: 'https://music.163.com/#/user/home?id=1501816384' },
]

type RevealLayerProps = {
  image: string
  cursorX: number
  cursorY: number
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [maskUrl, setMaskUrl] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2)
    ctx.fill()

    setMaskUrl(canvas.toDataURL())
  }, [cursorX, cursorY])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'none' }}
      />
      <div
        className="absolute inset-0 z-30 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : 'none',
          maskImage: maskUrl ? `url(${maskUrl})` : 'none',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
      />
    </>
  )
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  )
}

function App() {
  const mouse = useRef({ x: -999, y: -999 })
  const smooth = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1
      setCursorPos({ x: smooth.current.x, y: smooth.current.y })
      rafRef.current = window.requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const heroButtonClass =
    'bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30'

  const storyCards = useMemo(
    () => [
      {
        eyebrow: '我是谁',
        title: '一个把摄影当作长期练习的人，也是在持续记录的观察者。',
        body: '我把摄影当作长期练习：记录光线如何落下、颜色如何彼此衬托、以及日常里那些稍纵即逝却值得被留下的时刻。',
      },
      {
        eyebrow: '我分享什么',
        title: '关于构图、氛围、光线与视觉记忆的学习笔记。',
        body: '这里会持续更新我在摄影学习中的判断、拆解、练习和审美笔记，让每一次拍摄都慢慢长成一套更清晰的观看方式。',
      },
      {
        eyebrow: '在哪里继续看',
        title: '在不同的平台上，这份个人档案会继续向外生长。',
        body: '如果你想继续看到更多练习、作品和日常记录，可以从这些外部页面继续跟着我。',
      },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-white tracking-[-0.02em] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-white text-2xl font-playfair italic">kiwi</span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1 shadow-[0_12px_48px_rgba(0,0,0,0.18)]">
          {navItems.map((item, index) => (
            <button
              key={item}
              className={index === 0
                ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-white text-gray-950 shadow-[0_6px_24px_rgba(255,255,255,0.16)]'
                : 'px-4 py-1.5 rounded-full text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors'}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <a
          href="https://www.xiaohongshu.com/user/profile/5c4fa81a0000000010027712?xsec_token=YBuHV1H2q_hFsov_4fylWMCc_NJBsMJyzK-TRfVwRx9fU%3D&xsec_source=app_share&xhsshare=&shareRedId=N0k2RkQ9NUo2NzUyOTgwNjczOTk7PDc7&apptime=1782655112&share_id=46ea4f6245864970bbcaab4f69f3f995&share_channel=copy_link"
          target="_blank"
          rel="noreferrer"
          className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full shadow-[0_12px_36px_rgba(255,255,255,0.14)] transition-colors hover:bg-gray-100"
        >
          继续关注
        </a>

        <button
          type="button"
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md"
          aria-label="打开菜单"
        >
          <Menu size={18} />
        </button>
      </nav>

      <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: '100dvh' }}>
        <div
          className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.32)_58%,rgba(0,0,0,0.68)_100%)]" />

        <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
          <p className="hero-anim hero-fade mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-medium tracking-[0.22em] text-white/75 backdrop-blur-md"
             style={{ animationDelay: '0.12s' }}>
            kiwi · 摄影档案 · 视觉笔记
          </p>
          <h1 className="max-w-5xl text-white leading-[0.95] drop-shadow-[0_10px_48px_rgba(0,0,0,0.34)]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              留住瞬间
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
              也留住感受
            </span>
          </h1>
        </div>

        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-sm text-white/80 leading-7 sm:leading-relaxed">
            我把每一次按下快门都当作一次学习：从流动的光线、安静的角落，到那些细微却真实的感受，慢慢训练自己看见更多。
          </p>
        </div>

        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[300px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-6 sm:leading-relaxed">
            这里收纳了我的摄影笔记、视觉参考和持续更新的平台入口，让这份个人档案不只停留在单一页面，而是继续向外延伸。
          </p>
          <a className={heroButtonClass} href="#journal">
            开始浏览
          </a>
        </div>
      </section>

      <main className="relative bg-[#050505] px-5 pb-16 pt-14 sm:px-8 lg:px-12">
        <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]" id="journal">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10 lg:p-12">
            <p className="mb-4 text-xs tracking-[0.22em] text-white/45">当前重点</p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              把摄影学习里的观察、练习与灵感，整理成一份持续生长的个人视觉档案。
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              这次改版会借用更沉浸、更有叙事感的首屏语言，但内容依然回到你自己的主页：你是谁、你在记录什么、以及别人该去哪里继续看到你的作品与日常更新。
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#e8702a]/20 bg-[#120c08] p-7 shadow-[0_30px_100px_rgba(232,112,42,0.18)] sm:p-10 lg:p-12">
            <p className="mb-4 text-xs tracking-[0.22em] text-[#f0b38d]">继续关注</p>
            <div className="space-y-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/85 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <span>{link.label}</span>
                  <span className="text-white/50">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-3 lg:mt-10">
          {storyCards.map((card, index) => (
            <article
              key={card.eyebrow}
              className={index === 1
                ? 'rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:translate-y-8'
                : 'rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]'}
            >
              <p className="mb-4 text-xs tracking-[0.22em] text-white/45">{card.eyebrow}</p>
              <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-white">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/70">{card.body}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-20 flex max-w-6xl flex-col gap-8 rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-7 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.28)] sm:px-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.22em] text-white/45">静静生长的档案</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              一张不断更新的个人主页，也是一份可回看的摄影手记。
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              它既是你的入口页，也是一个持续展开的索引：把摄影学习笔记、作品、灵感来源和外部平台连接到一起，让访问者快速理解你正在记录怎样的世界。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/75 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
