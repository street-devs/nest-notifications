import { Type } from '@nestjs/common'
import { NotificationChannel } from './abstract.channel'

export abstract class Notification<T = any> {
  public readonly data: T

  public constructor(data: T) {
    this.data = data
  }

  // Get the notification's delivery channels.
  public abstract via(): Type<NotificationChannel>[]

  public async shouldNotify(): Promise<boolean> {
    return true
  }
}
