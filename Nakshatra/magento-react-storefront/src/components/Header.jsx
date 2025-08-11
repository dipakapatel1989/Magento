import { Link } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { useCartStore } from '../store/cart'

const GET_CART_SUMMARY = gql`
  query GetCartSummary($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      total_quantity
    }
  }
`

export default function Header() {
  const cartId = useCartStore(s => s.cartId)
  const { data } = useQuery(GET_CART_SUMMARY, {
    variables: { cartId },
    skip: !cartId,
    fetchPolicy: 'cache-and-network',
  })

  const qty = data?.cart?.total_quantity ?? 0

  return (
    <header style={{ padding: 16, display: 'flex', gap: 16, borderBottom: '1px solid #eee' }}>
      <Link to="/">Home</Link>
      <Link to="/cart">Cart ({qty})</Link>
    </header>
  )
}