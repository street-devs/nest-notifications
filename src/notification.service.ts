import { Injectable, Type } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Notification } from './abstract.notification'
import { NotificationChannel } from './abstract.channel'

export interface ISendNotificationResponse<T = any> {
  [_tag: string]: { success: boolean; response: T }
}

@Injectable()
export class NotificationService {
  private _channelsCache = new Map<
    Type<NotificationChannel>,
    NotificationChannel
  >()

  public constructor(private readonly _moduleRef: ModuleRef) {}

  public async send(
    notification: Notification
  ): Promise<ISendNotificationResponse[]> {
    const channels = notification.via()

    if (!channels.length) return []

    return Promise.all(
      channels.map((channel) => this.sendToChannel(channel, notification))
    ).then(
      (responses) => responses.filter(Boolean) as ISendNotificationResponse[]
    )
  }

  public async sendToChannel(
    channel: Type<NotificationChannel>,
    notification: Notification
  ): Promise<ISendNotificationResponse | void> {
    if (!notification.shouldNotify()) {
      return
    }

    const resolvedChannel = await this.getChannel(channel)

    return resolvedChannel
      .send(notification)
      .then((response) => ({
        [resolvedChannel._tag]: { response, success: true },
      }))
      .catch((response) => ({
        [resolvedChannel._tag]: { response, success: false },
      }))
  }

  protected async getChannel(
    channel: Type<NotificationChannel>
  ): Promise<NotificationChannel> {
    if (this._channelsCache.has(channel)) {
      return this._channelsCache.get(channel)!
    }

    const newChannelInstance = await this._moduleRef.create(channel)

    this._channelsCache.set(channel, newChannelInstance)

    return newChannelInstance
  }
}
