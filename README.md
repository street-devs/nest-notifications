# NestJS Notifications

### A simple and light-weight package provides support for sending notifications across a variety of delivery channels

Notifications are brief messages that notify users about events in your app, such as sending an "Invoice Paid" notification via email and SMS in a billing app.

Nest Notifications offers multi-channel notifications, so you can build your own channels, such as email, SMS (via Vonage, formerly Nexmo), Slack, and more. Community-created channels extend this further. Notifications can also be stored in a database for web interface.

## Installation
First, install NotificationsModule into your project using the `npm`:

```shell
npm install --save @street-devs/nest-notifications
```

### Register `NotificationsModule` to your application module

```
import { NotificationsModule } from '@street-devs/nest-notifications'

@Module({
  imports: [
    NotificationsModule,
  ],
  ...
})
export class AppModule {}
```

## Example send notification to Slack channel

#### First, we need to install relevant package

```
npm intall --save @slack/webhook;
```

#### Register your notification

```
// order-status-updated.notification.ts

import { Notification } from '@street-devs/nest-notifications'
import { OrderStatusUpdatedSlackChannel } from './order-status-updated.slack.channel'

interface OrderEntity {
  id: string
  user: {
    name: string
    email: string
  }
}

export class OrderStatusUpdated extends Notification<{
  order: OrderEntity
  status: string
}> {
  // Get the notification's delivery channels.
  public via() {
    return [OrderStatusUpdatedSlackChannel]
  }
}

```

#### Create your Slack handler channel

```
// order-status-updated.slack.channel.ts

import { NotificationChannel } from '@street-devs/nest-notifications'
import type { OrderStatusUpdated } from './order-status-updated.notification'
import {
  IncomingWebhook,
  IncomingWebhookSendArguments,
  IncomingWebhookResult,
} from '@slack/webhook'

export class OrderStatusUpdatedSlackChannel extends NotificationChannel {
  public getDataToBroadcast(notification: OrderStatusUpdated): IncomingWebhookSendArguments {
    const { order, status } = notification.data

    const { name, email } = order.user

    return {
      text: `Order #${order.id} was ${status}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Order was ${status}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `
              Order *#${order.id}* has just been ${status}
              \n
              User: *${name}* - *${email}*`,
          },
        },
      ],
    }
  }

  public async send(
    notification: OrderStatusUpdated
  ): Promise<any> {
    // Put your slack hook url here
    return new IncomingWebhook(process.env.YOUR_SLACK_HOOK_URL)
      .send(this.getDataToBroadcast(notification))
  }
}

```
