'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/lib/stores/userStore'

/**
 * Komponen ini tidak merender apapun di UI.
 * Tugasnya hanya menjalankan timer regen nyawa di background.
 * Taruh di layout.tsx agar aktif di semua halaman.
 */
export default function HeartTimer() {
  const regenHearts = useUserStore((s) => s.regenHearts)

  useEffect(() => {
    // Cek regen saat pertama kali app dibuka
    regenHearts()

    // Cek setiap 30 detik
    const interval = setInterval(() => {
      regenHearts()
    }, 30 * 1000)

    return () => clearInterval(interval)
  }, [regenHearts])

  return null
}
