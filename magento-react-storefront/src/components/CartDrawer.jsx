// JavaScript: src/components/CartDrawer.jsx
import { useQuery, gql } from '@apollo/client'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { GET_CART_SUMMARY } from '../graphql/queries'


export default function CartDrawer({ open, onClose }) {
  const cartId = useCartStore(s => s.cartId)
  const { data, loading } = useQuery(GET_CART_SUMMARY, { variables: { cartId }, skip: !cartId })

  const cart = data?.cart
  const items = cart?.items ?? []
  const grand = cart?.prices?.grand_total

  return (
    <aside className={`cart-drawer ${open ? 'open' : ''}` } aria-hidden={!open} >
      <div className="cart-header">
        <strong>Your Cart</strong>
        <button className="nav-button" onClick={onClose}>Close</button>
      </div>

      <div className="cart-body">
        {!cartId && <p>Your cart is empty.</p>}
        {cartId && loading && <p>Loading…</p>}
        {cartId && !loading && items.length === 0 && <p>No items yet.</p>}
        {items.map(it => (
          <div key={it.id} className="row" style={{ alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            {it.product.small_image?.url && (
              <img src={it.product.small_image.url} alt={it.product.name} width={48} height={48} style={{ borderRadius: 8, objectFit: 'cover' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{it.product.name}</div>
              <div style={{ color: 'var(--muted)' }}>Qty: {it.quantity}</div>
            </div>
            <div style={{ fontWeight: 600 }}>
              {it.prices?.row_total?.value} {it.prices?.row_total?.currency}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div style={{ color: 'var(--muted)' }}>Subtotal</div>
          <div style={{ fontWeight: 700 }}>
            {grand?.value} {grand?.currency}
          </div>
        </div>
        <Link to="/checkout" onClick={onClose} className="btn">Go to checkout</Link>
      </div>
    </aside>
  )
}