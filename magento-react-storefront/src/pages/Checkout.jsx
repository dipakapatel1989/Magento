import { useMutation, useQuery, gql } from '@apollo/client'
import { useCartStore } from '../store/cart'
import { SET_GUEST_EMAIL, SET_SHIPPING_ADDRESS, SET_SHIPPING_METHOD, SET_BILLING_ADDRESS, SET_PAYMENT_METHOD, PLACE_ORDER } from '../graphql/mutations'
import { useState } from 'react'

const GET_AVAILABLE_SHIPPING = gql`
  query GetShippingMethods($cartId: String!) {
    cart(cart_id: $cartId) {
      shipping_addresses {
        available_shipping_methods {
          carrier_code
          method_code
          amount { value currency }
          method_title
        }
      }
    }
  }
`

export default function Checkout() {
  const cartId = useCartStore(s => s.cartId)
  const [email, setEmail] = useState('')
  const [addr, setAddr] = useState({
    firstname: 'John',
    lastname: 'Doe',
    street: ['123 Main St'],
    city: 'City',
    region: 'CA',
    postcode: '90001',
    country_code: 'US',
    telephone: '555-555-5555',
  })
  const { data: shippingData, refetch } = useQuery(GET_AVAILABLE_SHIPPING, {
    variables: { cartId },
    skip: !cartId,
  })

  const [setGuestEmail] = useMutation(SET_GUEST_EMAIL)
  const [setShippingAddress] = useMutation(SET_SHIPPING_ADDRESS)
  const [setShippingMethod] = useMutation(SET_SHIPPING_METHOD)
  const [setBillingAddress] = useMutation(SET_BILLING_ADDRESS)
  const [setPaymentMethod] = useMutation(SET_PAYMENT_METHOD)
  const [placeOrder, { data: orderData, loading: placing }] = useMutation(PLACE_ORDER)

  if (!cartId) return <p>No cart</p>

  const submit = async () => {
    await setGuestEmail({ variables: { cartId, email } })

    await setShippingAddress({
      variables: {
        cartId,
        address: {
          address: addr,
        },
      },
    })

    await refetch()

    // pick first available shipping method for demo
    const method = shippingData?.cart?.shipping_addresses?.[0]?.available_shipping_methods?.[0]
    if (!method) return alert('No shipping methods available (check Magento configs).')

    await setShippingMethod({
      variables: { cartId, carrierCode: method.carrier_code, methodCode: method.method_code },
    })

    await setBillingAddress({
      variables: {
        cartId,
        address: {
          same_as_shipping: true,
          address: addr,
        },
      },
    })

    // Payment method must be enabled in Magento (e.g., check/money order: checkmo)
    await setPaymentMethod({ variables: { cartId, code: 'checkmo' } })

    const res = await placeOrder({ variables: { cartId } })
    alert(`Order placed: ${res?.data?.placeOrder?.order?.order_number}`)
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Checkout</h1>
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <button onClick={submit} disabled={placing}>
        {placing ? 'Placing order…' : 'Place order'}
      </button>
      {orderData?.placeOrder?.order?.order_number && (
        <p>Order: {orderData.placeOrder.order.order_number}</p>
      )}
    </div>
  )
}