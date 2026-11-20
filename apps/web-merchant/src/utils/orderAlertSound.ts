export const ORDER_ALERT_SOUND_READY_EVENT = 'tap2go:merchant-order-sound-ready'
export const ORDER_ALERT_SOUND_ERROR_EVENT = 'tap2go:merchant-order-sound-error'

function playBellTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  volume: number,
  type: OscillatorType,
): OscillatorNode {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.34)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + 0.35)
  return oscillator
}

export class OrderAlertSound {
  private context: AudioContext | null = null

  get isReady() {
    return this.context?.state === 'running'
  }

  private oscillators = new Set<OscillatorNode>()

  async unlock() {
    if (!window.AudioContext) {
      throw new Error('This browser does not support audio playback.')
    }

    this.context ??= new window.AudioContext()
    if (this.context.state !== 'running') await this.context.resume()
    if (this.context.state !== 'running') {
      throw new Error('The browser did not allow audio playback.')
    }
  }

  playBell() {
    if (!this.context || this.context.state !== 'running') return false

    const now = this.context.currentTime
    this.playTone(1397, now, 0.16, 'triangle')
    this.playTone(2794, now, 0.055, 'sine')
    this.playTone(1760, now + 0.2, 0.16, 'triangle')
    this.playTone(3520, now + 0.2, 0.045, 'sine')
    return true
  }

  stop() {
    for (const oscillator of this.oscillators) {
      oscillator.stop()
    }
    this.oscillators.clear()
  }

  async close() {
    const context = this.context
    this.context = null
    this.stop()
    if (context && context.state !== 'closed') await context.close()
  }

  private playTone(frequency: number, startAt: number, volume: number, type: OscillatorType) {
    const context = this.context
    if (!context) return
    const oscillator = playBellTone(context, frequency, startAt, volume, type)
    this.oscillators.add(oscillator)
    oscillator.addEventListener('ended', () => this.oscillators.delete(oscillator), { once: true })
  }
}

export const orderAlertSound = new OrderAlertSound()
