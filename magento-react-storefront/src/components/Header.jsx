// JavaScript
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_TOP_CATEGORIES, GET_CART_SUMMARY } from '../graphql/queries'
import { useCartStore } from '../store/cart'
import CartDrawer from './CartDrawer'
import NavMenu from './NavMenu'

export default function Header() {
  const [open, setOpen] = useState(false)

  const cartId = useCartStore(s => s.cartId)
  const { data: cartData } = useQuery(GET_CART_SUMMARY, {
    variables: { cartId },
    skip: !cartId,
    fetchPolicy: 'cache-and-network'
  })

  const { data: catData } = useQuery(GET_TOP_CATEGORIES)
  const qty = cartData?.cart?.total_quantity ?? 0
  const cats = catData?.categories?.items ?? []

  return (
    <div className="header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Home">
          <span className="brand-badge" />
          <span>Storefront</span>
        </Link>

        <nav className="nav">
          <NavMenu label="Shop" categories={cats} />
          <ul className="nav">
            {cats.map((item) => (
              <li key={item.id}>
                {item.name}
              </li>
      ))}
          </ul>
        </nav>

        <div className="spacer" />

        <button className="icon-btn" onClick={() => setOpen(true)}>
          <span>Cart</span>
          <span className="badge">{qty}</span>
        </button>
      </div>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  )
}