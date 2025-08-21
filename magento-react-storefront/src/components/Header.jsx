// JavaScript
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_TOP_CATEGORIES, GET_CART_SUMMARY } from '../graphql/queries'
import { useCartStore } from '../store/cart'
import CartDrawer from './CartDrawer'
import NavMenu from './NavMenu'

export default function Header() {
    const [cartOpen, setCartOpen] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
        <header className="header flex-center">
            <div className="header-inner">
                <button
                    className="icon-btn only-mobile"
                    aria-label="Open menu"
                    aria-expanded={mobileNavOpen}
                    onClick={() => setMobileNavOpen(v => !v)}
                >
                    ☰
                </button>

                <Link to="/" className="brand" aria-label="Home">
                    <span className="brand-badge" />
                    <span>Best Buy</span>
                </Link>

                <nav className="nav hide-mobile">
                    <NavMenu label="Shop" categories={cats} />
                </nav>

                <div className="spacer" />

                <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Open cart">
                    <span>Cart</span>
                    <span className="badge">{qty}</span>
                </button>
            </div>

            {/* Mobile slide-down menu */}
            <div className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
                <NavMenu label="Browse categories" categories={cats} variant="mobile" onNavigate={() => setMobileNavOpen(false)} />
            </div>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </header>
    )
}