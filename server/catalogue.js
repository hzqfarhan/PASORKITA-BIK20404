import { rows, one } from './db.js';
import { idValue, integer } from './domain.js';

export const productSQL = `SELECT p.*, c.name AS category, c.icon AS category_icon,
  u.name AS owner_name, COALESCE(b.name,u.name) AS seller_name,
  COALESCE((SELECT AVG(rating) FROM pasor_kita.reviews r WHERE r.product_id=p.id AND r.kind='item' AND NOT r.hidden),0) AS rating,
  (SELECT COUNT(*)::int FROM pasor_kita.reviews r WHERE r.product_id=p.id AND r.kind='item' AND NOT r.hidden) AS review_count,
  COALESCE((SELECT AVG(rating) FROM pasor_kita.reviews r WHERE r.target_user_id=p.seller_id AND r.kind='seller' AND NOT r.hidden),0) AS seller_rating,
  COALESCE((SELECT STRING_AGG(v.type,',') FROM pasor_kita.verification_requests v WHERE v.business_id=p.business_id AND v.status='approved'),'') AS badges,
  EXISTS(SELECT 1 FROM pasor_kita.favorites f WHERE f.product_id=p.id AND f.user_id=$1) AS saved
  FROM pasor_kita.products p JOIN pasor_kita.categories c ON c.id=p.category_id
  JOIN pasor_kita.users u ON u.id=p.seller_id LEFT JOIN pasor_kita.businesses b ON b.id=p.business_id`;
export const getProduct = (id, userId = 0) => one(productSQL + " WHERE p.id=$2 AND p.status='active'", [userId, idValue(id)]);
export const getCategories = () => rows('SELECT * FROM pasor_kita.categories ORDER BY id');
export async function listProducts(filters = {}, userId = 0) {
  const conditions = ["p.status='active'"], params = [userId];
  const add = (sql, value) => { params.push(value); conditions.push(sql.replace('?', '$' + params.length)); };
  if (typeof filters.q === 'string' && filters.q.trim()) add("(p.title || ' ' || p.description || ' ' || COALESCE(b.name,u.name)) ILIKE ?", '%' + filters.q.trim().slice(0,100) + '%');
  if (filters.category) add('p.category_id=?', idValue(filters.category));
  if (['Parit Raja','Pagoh'].includes(filters.campus)) add('p.campus=?', filters.campus);
  if (filters.maxPrice) add('p.price<=?', integer(filters.maxPrice, 1, 1000000, 'maximum price'));
  if (filters.business === '1') conditions.push('p.business_id IS NOT NULL');
  if (filters.saved) { params.push(userId); conditions.push(`EXISTS(SELECT 1 FROM pasor_kita.favorites sf WHERE sf.product_id=p.id AND sf.user_id=$${params.length})`); }
  const sort = ({ newest: 'p.created_at DESC', 'price-low': 'p.price ASC', 'price-high': 'p.price DESC' })[filters.sort] || 'p.created_at DESC';
  const page = filters.page ? integer(filters.page,1,10000,'page') : 1;
  return rows(productSQL + ' WHERE ' + conditions.join(' AND ') + ` ORDER BY ${sort},p.id DESC LIMIT 24 OFFSET ${(page-1)*24}`, params);
}
