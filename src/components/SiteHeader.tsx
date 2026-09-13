import { ImagePlus, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: '首页', href: '#home' },
  { label: '摄影笔记', href: '#notes' },
  { label: '发布笔记', href: '#publish' },
  { label: '关于 kiwi', href: '#about' },
]

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  )
}

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <a className="flex items-center gap-3 text-white" href="#home" aria-label="返回首页">
        <LogoMark />
        <span className="font-playfair text-2xl italic">kiwi</span>
      </a>

      <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/25 px-2 py-2 shadow-[0_12px_48px_rgba(0,0,0,0.18)] backdrop-blur-md md:flex">
        {navItems.map((item, index) => (
          <a key={item.href} href={item.href} className={index === 0 ? 'rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-950 shadow-[0_6px_24px_rgba(255,255,255,0.16)]' : 'rounded-full px-4 py-1.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/15 hover:text-white'}>
            {item.label}
          </a>
        ))}
      </div>

      <a className="hidden items-center gap-2 rounded-full bg-[#e8702a] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 active:translate-y-0 md:inline-flex" href="#publish">
        <ImagePlus size={16} />
        写一条笔记
      </a>

      <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md md:hidden" aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'} onClick={() => setMobileMenuOpen((open) => !open)}>
        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileMenuOpen && (
        <div className="absolute left-4 right-4 top-[4.5rem] rounded-3xl border border-white/15 bg-[#111]/90 p-3 shadow-2xl backdrop-blur-xl md:hidden">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-2xl px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
