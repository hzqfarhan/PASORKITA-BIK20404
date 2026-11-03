import { timingSafeEqual, randomBytes } from 'node:crypto';

export class InputError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export const textValue = (value, min, max, label) => {
  if (typeof value !== 'string') throw new InputError(`Enter ${label}.`);
  const result = value.trim().normalize('NFC');
  if (result.length < min || result.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(result)) throw new InputError(`${label} must contain ${min}-${max} characters.`);
  return result;
};
export function integer(value, min, max, label = 'a valid number') {
  if (!/^\d+$/.test(String(value))) throw new InputError(`Enter ${label}.`);
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < min || result > max) throw new InputError(`Enter ${label} between ${min} and ${max}.`);
  return result;
}
export const idValue = value => integer(value, 1, 2147483647, 'a valid record ID');
export function priceValue(value) {
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(String(value)) || Number(value) <= 0) throw new InputError('Enter a price from RM 0.01 to RM 999999.99, with up to two decimal places.');
  return Number(value).toFixed(2);
}
export function emailValue(value) {
  const email = textValue(value, 6, 190, 'your university email').toLowerCase();
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(student\.uthm\.edu\.my|uthm\.edu\.my)$/.test(email)) throw new InputError('Use your @student.uthm.edu.my or @uthm.edu.my email.');
  return email;
}
export function campusValue(value) {
  if (!['Parit Raja', 'Pagoh'].includes(value)) throw new InputError('Choose Parit Raja or Pagoh.');
  return value;
}
export function passwordValue(value) {
  if (typeof value !== 'string' || value.length < 10 || Buffer.byteLength(value) > 72) throw new InputError('Use a password of at least 10 characters and at most 72 bytes.');
  return value;
}
export const money = value => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(Number(value || 0));
export const initials = name => String(name).trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
export const token = () => randomBytes(32).toString('hex');
export function equalToken(a, b) { return typeof a === 'string' && typeof b === 'string' && /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
export function canTransition(order, actorId, next) {
  if (order.status === 'completed' || order.status === 'cancelled') return false;
  if (next === 'cancelled') return actorId === order.seller_id || actorId === order.buyer_id && order.status === 'pending';
  return actorId === order.seller_id && ({ pending: 'accepted', accepted: 'ready', ready: 'completed' })[order.status] === next;
}
export function reviewTarget(order, actorId, kind) {
  if (order.status !== 'completed') throw new InputError('Reviews open after the order is completed.', 403);
  if (actorId === order.buyer_id && ['item', 'seller'].includes(kind)) return kind === 'seller' ? order.seller_id : null;
  if (actorId === order.seller_id && kind === 'buyer') return order.buyer_id;
  throw new InputError('You can only review your counterpart or purchased product.', 403);
}
