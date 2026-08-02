import {
  ArrowUpRight,
  Camera,
  ImagePlus,
  Menu,
  Send,
  X,
} from 'lucide-react'
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'
const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85'
const SPOTLIGHT_R = 260
const NOTES_STORAGE_KEY = 'kiwi-photo-notes'

const navItems = [
  { label: '首页', href: '#home' },
  { label: '摄影笔记', href: '#notes' },
  { label: '发布笔记', href: '#publish' },
  { label: '关于 kiwi', href: '#about' },
]

const socialLinks = [
  {
    label: '小红书',
    description: '日常更新与短笔记',
    href: 'https://www.xiaohongshu.com/user/profile/5c4fa81a0000000010027712?xsec_token=YBuHV1H2q_hFsov_4fylWMCc_NJBsMJyzK-TRfVwRx9fU%3D&xsec_source=app_share&xhsshare=&shareRedId=N0k2RkQ9NUo2NzUyOTgwNjczOTk7PDc7&apptime=1782655112&share_id=46ea4f6245864970bbcaab4f69f3f995&share_channel=copy_link',
  },
  { label: '500px / 视觉中国', description: '作品归档', href: 'https://500px.com.cn/kiwiberry' },
  { label: '网易云音乐', description: '拍照时在听的歌', href: 'https://music.163.com/#/user/home?id=1501816384' },
]

type JournalNote = {
  id: string
  title: string
  body: string
  image?: string
  createdAt: string
}

const starterNotes: JournalNote[] = [
  {
    id: 'starter-light',
    title: '先看光，再决定要不要按下快门',
    body: '最近拍照时，我会先站在原地多看几秒。光从哪里来，影子往哪里落，画面里最安静的地方在哪里，答案通常比参数更早出现。',
    createdAt: '2026 年 08 月',
  },
  {
    id: 'starter-walk',
    title: '散步是我最常用的取景方式',
    body: '不带明确目的地出门，反而更容易遇见一些值得记录的瞬间。街角、窗边、路人经过后的空白，都可能成为今天的画面。',
    createdAt: '2026 年 07 月',
  },
]

type RevealLayerProps = {
  image: string
  cursorX: number
  cursorY: number
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const spotlight =
    cursorX < 0
      ? 'none'
      : `radial-gradient(circle ${SPOTLIGHT_R}px at ${cursorX}px ${cursorY}px, rgba(0,0,0,1) 0%, rgba(0,0,0,.96) 42%, rgba(0,0,0,.64) 68%, transparent 100%)`

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat transition-[mask-image] duration-75"
      aria-hidden="true"
      style={{
        backgroundImage: `url(${image})`,
        WebkitMaskImage: spotlight,
        maskImage: spotlight,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
      }}
    />
  )
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  )
}

function formatNoteDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function App() {
  const mouse = useRef({ x: -999, y: -999 })
  const smooth = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notes, setNotes] = useState<JournalNote[]>([])
  const [notesReady, setNotesReady] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState('')
  const [imageName, setImageName] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const savedNotes = window.localStorage.getItem(NOTES_STORAGE_KEY)
    if (!savedNotes) {
      setNotes(starterNotes)
      setNotesReady(true)
      return
    }

    try {
      setNotes(JSON.parse(savedNotes) as JournalNote[])
    } catch {
      setNotes(starterNotes)
    }
    setNotesReady(true)
  }, [])

  useEffect(() => {
    if (notesReady) window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
  }, [notes, notesReady])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current = { x: event.clientX, y: event.clientY }
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
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const heroButtonClass =
    'inline-flex items-center gap-2 rounded-full bg-[#e8702a] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 active:translate-y-0'

  const storyCards = useMemo(
    () => [
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
    ],
    [],
  )

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 6 * 1024 * 1024) {
      setFormMessage('图片需要小于 6MB，请换一张图片。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(String(reader.result))
      setImageName(file.name)
      setFormMessage('图片已添加，可以继续写下这次拍摄。')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanBody = body.trim()
    if (!cleanBody) {
      setFormMessage('先写下一点文字，再发布这条笔记。')
      return
    }

    const newNote: JournalNote = {
      id: `${Date.now()}`,
      title: title.trim() || '没有标题的一页',
      body: cleanBody,
      image: image || undefined,
      createdAt: formatNoteDate(new Date()),
    }

    setNotes((currentNotes) => [newNote, ...currentNotes])
    setTitle('')
    setBody('')
    setImage('')
    setImageName('')
    setFormMessage('已发布，这条笔记现在就在你的档案里。')
    if (fileInputRef.current) fileInputRef.current.value = ''
    window.setTimeout(() => document.querySelector('#notes')?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  const removeNote = (id: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        <a className="flex items-center gap-3 text-white" href="#home" aria-label="返回首页">
          <LogoMark />
          <span className="font-playfair text-2xl italic">kiwi</span>
        </a>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/25 px-2 py-2 shadow-[0_12px_48px_rgba(0,0,0,0.18)] backdrop-blur-md md:flex">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={index === 0
                ? 'rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-950 shadow-[0_6px_24px_rgba(255,255,255,0.16)]'
                : 'rounded-full px-4 py-1.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/15 hover:text-white'}
            >
              {item.label}
            </a>
          ))}
        </div>

        <a className={`${heroButtonClass} hidden md:inline-flex`} href="#publish">
          <ImagePlus size={16} />
          写一条笔记
        </a>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md md:hidden"
          aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-4 right-4 top-[4.5rem] rounded-3xl border border-white/15 bg-[#111]/90 p-3 shadow-2xl backdrop-blur-xl md:hidden">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      <section id="home" className="relative h-screen w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>
        <div
          className="hero-zoom absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.32)_58%,rgba(0,0,0,0.72)_100%)]" />
        <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        <div className="pointer-events-none absolute left-0 right-0 top-[14%] z-50 flex flex-col items-center px-5 text-center">
          <p className="hero-anim hero-fade mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/75 backdrop-blur-md" style={{ animationDelay: '0.12s' }}>
            kiwi · 摄影档案 · 个人笔记
          </p>
          <h1 className="max-w-5xl leading-[0.95] text-white drop-shadow-[0_10px_48px_rgba(0,0,0,0.34)]">
            <span className="hero-anim hero-reveal block font-playfair text-5xl font-normal italic sm:text-7xl md:text-8xl" style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}>
              留住瞬间
            </span>
            <span className="hero-anim hero-reveal -mt-1 block text-5xl font-normal sm:text-7xl md:text-8xl" style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}>
              也留住感受
            </span>
          </h1>
        </div>

        <div className="hero-anim hero-fade absolute bottom-14 left-10 z-50 hidden max-w-[260px] sm:block md:left-14" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm leading-7 text-white/80">
            我把每一次按下快门，都当作一次练习。看光线怎么落下，看日常里那些微小却真实的感受，慢慢练习自己看见更多。
          </p>
        </div>

        <div className="hero-anim hero-fade absolute bottom-10 left-5 right-5 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[300px] sm:gap-5 md:right-14" style={{ animationDelay: '0.85s' }}>
          <p className="text-xs leading-6 text-white/80 sm:text-sm sm:leading-relaxed">
            这里是我的摄影主页：记录练习中的照片、当时的想法，以及一些值得回看的日常片段。
          </p>
          <a className={heroButtonClass} href="#notes">
            浏览我的笔记
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <main className="relative bg-[#050505] px-5 pb-20 pt-16 sm:px-8 lg:px-12">
        <section id="about" className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10 lg:p-12">
            <p className="mb-4 text-xs tracking-[0.2em] text-white/45">关于这页主页</p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-5xl">
              这是 kiwi 的个人摄影主页，也是一份还在写的视觉手记。
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              我在这里记录构图、光线、颜色和那些让我想停下来看的片刻。没有固定的更新计划，想到什么就写一点，拍到喜欢的画面就留下来。
            </p>
          </div>

          <div id="links" className="rounded-[2rem] border border-[#e8702a]/20 bg-[#120c08] p-7 shadow-[0_30px_100px_rgba(232,112,42,0.18)] sm:p-10 lg:p-12">
            <p className="mb-4 text-xs tracking-[0.2em] text-[#f0b38d]">在别处找到我</p>
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-all hover:border-white/20 hover:bg-white/10">
                  <span>
                    <span className="block text-sm text-white/90">{link.label}</span>
                    <span className="mt-1 block text-xs text-white/45">{link.description}</span>
                  </span>
                  <ArrowUpRight className="text-white/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" size={17} />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="notes" className="mx-auto mt-20 max-w-6xl scroll-mt-24">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] text-white/45">最近的摄影笔记</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">把看见的东西写下来。</h2>
            </div>
            <a className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white" href="#publish">
              <ImagePlus size={16} />
              发布一条新笔记
            </a>
          </div>

          {notes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {notes.map((note) => (
                <article key={note.id} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-1">
                  {note.image && <img src={note.image} alt="" className="h-56 w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02]" />}
                  <div className="p-7 sm:p-8">
                    <div className="mb-4 flex items-center justify-between gap-4 text-xs text-white/40">
                      <span>{note.createdAt}</span>
                      <button type="button" onClick={() => removeNote(note.id)} className="rounded-full px-2 py-1 text-white/35 transition-colors hover:bg-white/10 hover:text-white" aria-label={`删除笔记：${note.title}`}>
                        删除
                      </button>
                    </div>
                    <h3 className="max-w-xl text-2xl font-semibold leading-tight tracking-[-0.04em] text-white">{note.title}</h3>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/68">{note.body}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-7 py-14 text-center text-white/55">
              还没有笔记，先写下第一段关于这次拍摄的感受吧。
            </div>
          )}
        </section>

        <section id="publish" className="mx-auto mt-20 max-w-6xl scroll-mt-24 rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.28)] sm:p-10 lg:p-12">
          <div className="mb-8 flex items-start justify-between gap-5">
            <div>
              <p className="text-xs tracking-[0.2em] text-[#f0b38d]">写下今天的观察</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">发布一条摄影笔记</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">一张照片，一点文字，或者只是今天突然想记住的一个画面。</p>
            </div>
            <Camera className="hidden text-[#e8702a] sm:block" size={28} strokeWidth={1.5} />
          </div>

          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-white/75">标题</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：傍晚的光从窗边经过" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#e8702a]/60" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/75">正文</span>
                <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="写下这次拍摄的想法、当时的光线，或者只是你想留下的一句话……" rows={8} className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm leading-7 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#e8702a]/60" />
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-white/40">笔记会保存在当前浏览器中，换设备后不会同步。</p>
                <button type="submit" className={`${heroButtonClass} justify-center`}>
                  <Send size={16} />
                  发布笔记
                </button>
              </div>
              {formMessage && <p className="text-sm text-[#f0b38d]" role="status">{formMessage}</p>}
            </div>

            <div>
              <span className="mb-2 block text-sm text-white/75">配一张图片</span>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative flex min-h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/20 text-center transition-colors hover:border-[#e8702a]/60 hover:bg-[#e8702a]/[0.06]">
                {image ? (
                  <img src={image} alt="待发布的预览图" className="absolute inset-0 h-full w-full object-cover opacity-75" />
                ) : null}
                <span className="relative z-10 flex flex-col items-center gap-3 rounded-2xl bg-black/35 px-5 py-4 backdrop-blur-sm">
                  <ImagePlus className="text-[#f0b38d]" size={25} />
                  <span className="text-sm text-white">{imageName || '选择一张照片'}</span>
                  <span className="text-xs text-white/45">支持 JPG、PNG，最大 6MB</span>
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="sr-only" />
              {image && <button type="button" onClick={() => { setImage(''); setImageName(''); if (fileInputRef.current) fileInputRef.current.value = '' }} className="mt-3 text-xs text-white/45 transition-colors hover:text-white">移除图片</button>}
            </div>
          </form>
        </section>

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
          <div>
            <p className="font-playfair text-2xl italic text-white">kiwi</p>
            <p className="mt-2 text-sm text-white/45">把喜欢的光线和生活，慢慢记录下来。</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
            {socialLinks.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">{link.label}</a>)}
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
