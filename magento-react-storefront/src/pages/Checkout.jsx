// JavaScript
import { useMutation, useQuery, gql } from '@apollo/client'
import { useState } from 'react'
import { useCartStore } from '../store/cart'
import {
  SET_GUEST_EMAIL,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
  SET_BILLING_ADDRESS,
  SET_PAYMENT_METHOD,
  PLACE_ORDER
} from '../graphql/mutations'
import { GET_CART_SUMMARY } from '../graphql/queries'

const GET_AVAILABLE_SHIPPING = gql`
  query GetShippingMethods($cartId: String!) {
    cart(cart_id: $cartId) {
      shipping_addresses {
        available_shipping_methods {
          carrier_code
          method_code
          method_title
          amount { value currency }
        }
      }
    }
  }
`

export default function Checkout() {
  const cartId = useCartStore(s => s.cartId)
  const { data: cartData } = useQuery(GET_CART_SUMMARY, { variables: { cartId }, skip: !cartId })
  const { data: shippingData, refetch } = useQuery(GET_AVAILABLE_SHIPPING, {
    variables: { cartId },
    skip: !cartId
  })

  const [email, setEmail] = useState('')
  const [addr, setAddr] = useState({
    firstname: 'Jane',
    lastname: 'Doe',
    street: ['123 Main St'],
    city: 'City',
    region: 'CA',
    postcode: '90001',
    country_code: 'US',
    telephone: '555-555-5555'
  })

  const [setGuestEmail] = useMutation(SET_GUEST_EMAIL)
  const [setShippingAddress] = useMutation(SET_SHIPPING_ADDRESS)
  const [setShippingMethod] = useMutation(SET_SHIPPING_METHOD)
  const [setBillingAddress] = useMutation(SET_BILLING_ADDRESS)
  const [setPaymentMethod] = useMutation(SET_PAYMENT_METHOD)
  const [placeOrder, { loading: placing }] = useMutation(PLACE_ORDER)

  if (!cartId) return <div className="container"><p>No cart found.</p></div>

  const submit = async () => {
    if (!email) return alert('Please provide an email')

    await setGuestEmail({ variables: { cartId, email } })
    await setShippingAddress({ variables: { cartId, address: { address: addr } } })

    await refetch()
    const method = shippingData?.cart?.shipping_addresses?.[0]?.available_shipping_methods?.[0]
    if (!method) return alert('No shipping methods available')

    await setShippingMethod({
      variables: { cartId, carrierCode: method.carrier_code, methodCode: method.method_code }
    })

    await setBillingAddress({
      variables: { cartId, address: { same_as_shipping: true, address: addr } }
    })

    // Ensure the code is enabled in Magento (example: checkmo)
    await setPaymentMethod({ variables: { cartId, code: 'checkmo' } })

    const res = await placeOrder({ variables: { cartId } })
    alert(`Order placed: ${res?.data?.placeOrder?.order?.order_number}`)
  }

  const grand = cartData?.cart?.prices?.grand_total

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Checkout</h2>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card" style={{ padding: 16 }}>
          <h3>Contact</h3>
          <input
            className="subtle"
            placeholder="Email address"
            style={{ width: '100%', padding: 10, marginTop: 8 }}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <h3 style={{ marginTop: 18 }}>Shipping address</h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <input className="subtle" value={addr.firstname} onChange={e => setAddr({ ...addr, firstname: e.target.value })} placeholder="First name" />
            <input className="subtle" value={addr.lastname} onChange={e => setAddr({ ...addr, lastname: e.target.value })} placeholder="Last name" />
          </div>
          <input className="subtle" value={addr.street[0]} onChange={e => setAddr({ ...addr, street: [e.target.value] })} placeholder="Street" style={{ width: '100%' }} />
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <input className="subtle" value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} placeholder="City" />
            <input className="subtle" value={addr.region} onChange={e => setAddr({ ...addr, region: e.target.value })} placeholder="Region" />
            <input className="subtle" value={addr.postcode} onChange={e => setAddr({ ...addr, postcode: e.target.value })} placeholder="Postcode" />
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <input className="subtle" value={addr.country_code} onChange={e => setAddr({ ...addr, country_code: e.target.value })} placeholder="Country code" />
            <input className="subtle" value={addr.telephone} onChange={e => setAddr({ ...addr, telephone: e.target.value })} placeholder="Telephone" />
          </div>

          <button className="btn" onClick={submit} disabled={placing} style={{ marginTop: 14 }}>
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h3>Order summary</h3>
          {(cartData?.cart?.items ?? []).map(it => (
            <div key={it.id} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {it.product.small_image?.url && <img src={it.product.small_image.url} alt={it.product.name} width={40} height={40} style={{ borderRadius: 6, objectFit: 'cover' }} />}
                <div>{it.product.name} × {it.quantity}</div>
              </div>
              <div style={{ fontWeight: 700 }}>
                {it.prices?.row_total?.value} {it.prices?.row_total?.currency}
              </div>
            </div>
          ))}
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
            <div style={{ color: 'var(--muted)' }}>Total</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {grand?.value} {grand?.currency}
            </div>
          </div>
          <p style={{ color: 'var(--muted)' }}>
            Payment method will be set to a store-enabled method (e.g., checkmo) during placement.
          </p>
        </div>
      </div>
    </div>
  )
}