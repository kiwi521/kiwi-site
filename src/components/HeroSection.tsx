import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'
const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85'
const SPOTLIGHT_R = 260

function RevealLayer({ cursorX, cursorY }: { cursorX: number; cursorY: number }) {
  const spotlight = cursorX < 0 ? 'none' : `radial-gradient(circle ${SPOTLIGHT_R}px at ${cursorX}px ${cursorY}px, rgba(0,0,0,1) 0%, rgba(0,0,0,.96) 42%, rgba(0,0,0,.64) 68%, transparent 100%)`

  return <div className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat transition-[mask-image] duration-75" aria-hidden="true" style={{ backgroundImage: `url(${BG_IMAGE_2})`, WebkitMaskImage: spotlight, maskImage: spotlight, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} />
}

export function HeroSection() {
  const mouse = useRef({ x: -999, y: -999 })
  const smooth = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })

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

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-black" style={{ height: '100dvh' }}>
      <div className="hero-zoom absolute inset-0 z-10 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${BG_IMAGE_1})` }} aria-hidden="true" />
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.32)_58%,rgba(0,0,0,0.72)_100%)]" />
      <RevealLayer cursorX={cursorPos.x} cursorY={cursorPos.y} />

      <div className="pointer-events-none absolute left-0 right-0 top-[14%] z-50 flex flex-col items-center px-5 text-center">
        <p className="hero-anim hero-fade mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/75 backdrop-blur-md" style={{ animationDelay: '0.12s' }}>kiwi · 摄影档案 · 个人笔记</p>
        <h1 className="max-w-5xl leading-[0.95] text-white drop-shadow-[0_10px_48px_rgba(0,0,0,0.34)]">
          <span className="hero-anim hero-reveal block font-playfair text-5xl font-normal italic sm:text-7xl md:text-8xl" style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}>留住瞬间</span>
          <span className="hero-anim hero-reveal -mt-1 block text-5xl font-normal sm:text-7xl md:text-8xl" style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}>也留住感受</span>
        </h1>
      </div>

      <div className="hero-anim hero-fade absolute bottom-14 left-10 z-50 hidden max-w-[260px] sm:block md:left-14" style={{ animationDelay: '0.7s' }}>
        <p className="text-sm leading-7 text-white/80">我把每一次按下快门，都当作一次练习。看光线怎么落下，看日常里那些微小却真实的感受，慢慢练习自己看见更多。</p>
      </div>

      <div className="hero-anim hero-fade absolute bottom-10 left-5 right-5 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[300px] sm:gap-5 md:right-14" style={{ animationDelay: '0.85s' }}>
        <p className="text-xs leading-6 text-white/80 sm:text-sm sm:leading-relaxed">这里是我的摄影主页：记录练习中的照片、当时的想法，以及一些值得回看的日常片段。</p>
        <a className="inline-flex items-center gap-2 rounded-full bg-[#e8702a] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 active:translate-y-0" href="#notes">浏览我的笔记 <ArrowUpRight size={16} /></a>
      </div>
    </section>
  )
}
