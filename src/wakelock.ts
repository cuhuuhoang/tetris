import NoSleep from 'nosleep.js'

export interface WakeLockController {
  enable: () => Promise<void>
  disable: () => Promise<void>
  isActive: () => boolean
}

export function createWakeLockManager(): WakeLockController {
  let sentinel: WakeLockSentinel | null = null
  let noSleep: NoSleep | null = null
  let active = false

  const requestNativeLock = async () => {
    if (!('wakeLock' in navigator)) return
    try {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => {
        if (active && document.visibilityState === 'visible') {
          requestNativeLock().catch(() => {
            /* noop */
          })
        }
      })
    } catch {
      sentinel = null
    }
  }

  const enable = async () => {
    if (active) return
    active = true
    if (document.visibilityState === 'visible') {
      await requestNativeLock()
    }
    if (!sentinel) {
      if (!noSleep) {
        noSleep = new NoSleep()
      }
      try {
        await noSleep.enable()
      } catch {
        // ignore failures when autoplay is blocked
      }
    }
  }

  const disable = async () => {
    active = false
    if (sentinel) {
      try {
        await sentinel.release()
      } catch {
        /* noop */
      } finally {
        sentinel = null
      }
    }
    if (noSleep) {
      try {
        await noSleep.disable()
      } catch {
        /* noop */
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!active) return
    if (document.visibilityState === 'visible') {
      requestNativeLock().catch(() => {
        /* noop */
      })
    } else if (sentinel) {
      sentinel.release().catch(() => {
        /* noop */
      })
      sentinel = null
    }
  })

  return {
    enable,
    disable,
    isActive: () => active
  }
}
