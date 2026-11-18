function playBellTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  volume: number,
  type: OscillatorType,
) {
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
}

export class OrderAlertSound {
  private context: AudioContext | null = null

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
    playBellTone(this.context, 1397, now, 0.16, 'triangle')
    playBellTone(this.context, 2794, now, 0.055, 'sine')
    playBellTone(this.context, 1760, now + 0.2, 0.16, 'triangle')
    playBellTone(this.context, 3520, now + 0.2, 0.045, 'sine')
    return true
  }

  async close() {
    const context = this.context
    this.context = null
    if (context && context.state !== 'closed') await context.close()
  }
}
