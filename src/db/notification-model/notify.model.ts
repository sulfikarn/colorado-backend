import {model} from 'mongoose';
import {Schema} from 'mongoose';
import {Document, Model} from 'mongoose';
import {NOTIFICATION_DB} from '../../constants';

const NotificationSchema = new Schema({
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

/* eslint camelcase: 0 */
export interface INotification {
    data: any
}

export interface INotificationDocument extends INotification, Document {}
export interface INotificationModel extends Model<INotificationDocument> {}
// eslint-disable-next-line max-len
export const NotificationModel = model<INotificationDocument>(NOTIFICATION_DB, NotificationSchema);
