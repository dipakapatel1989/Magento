import { useQuery, gql, useMutation } from '@apollo/client'
import { useCartStore } from '../store/cart'

const GET_CART = gql`
  query GetCart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      total_quantity
      prices {
        grand_total { value currency }
      }
      items {
        id
        quantity
        product {
          name
          small_image { url }
          sku
        }
        prices {
          price { value currency }
          row_total { value currency }
        }
      }
    }
  }
`

export default function Cart() {
  const cartId = useCartStore(s => s.cartId)
  const { data, loading, error } = useQuery(GET_CART, { variables: { cartId }, skip: !cartId })

  if (!cartId) return <p>Your cart is empty.</p>
  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>

  const cart = data?.cart

  return (
    <div style={{ padding: 16 }}>
      <h1>Cart</h1>
      {cart?.items?.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: 12, padding: 8, borderBottom: '1px solid #eee' }}>
          {item.product.small_image?.url && <img src={item.product.small_image.url} alt={item.product.name} width={60} />}
          <div style={{ flex: 1 }}>
            <div>{item.product.name}</div>
            <div>Qty: {item.quantity}</div>
            <div>
              Line total: {item.prices?.row_total?.value} {item.prices?.row_total?.currency}
            </div>
          </div>
        </div>
      ))}
      <h3>
        Grand total: {cart?.prices?.grand_total?.value} {cart?.prices?.grand_total?.currency}
      </h3>
    </div>
  )
}