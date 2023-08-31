import { Notification } from './abstract.notification'

export abstract class NotificationChannel<D = any, R = any> {
  public _tag: string

  public abstract send(notification: Notification): Promise<R>

  public abstract getDataToBroadcast(notification: Notification): D
}
