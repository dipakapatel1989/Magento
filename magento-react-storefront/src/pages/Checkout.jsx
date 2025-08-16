// JavaScript
import { useMutation, useQuery, gql } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useCartStore } from '../store/cart'
import {
    SET_GUEST_EMAIL,
    SET_SHIPPING_ADDRESS,
    SET_SHIPPING_METHOD,
    SET_BILLING_ADDRESS,
    SET_PAYMENT_METHOD,
    PLACE_ORDER,
} from '../graphql/mutations'
import { GET_CART_SUMMARY } from '../graphql/queries'
import { CREATE_EMPTY_CART } from '../graphql/mutations'
import { useNavigate } from 'react-router-dom'

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

const GET_AVAILABLE_PAYMENT = gql`
    query GetPaymentMethods($cartId: String!) {
        cart(cart_id: $cartId) {
            available_payment_methods {
                code
                title
            }
        }
    }
`

export default function Checkout() {
    const navigate = useNavigate()

    const cartId = useCartStore(s => s.cartId)
    const setCartId = useCartStore(s => s.setCartId)
    const clearCart = useCartStore(s => s.clearCart)

    const { data: cartData } = useQuery(GET_CART_SUMMARY, { variables: { cartId }, skip: !cartId })

    // Shipping methods
    const {
        data: shippingData,
        refetch: refetchShipping,
        loading: loadingShipping
    } = useQuery(GET_AVAILABLE_SHIPPING, {
        variables: { cartId },
        skip: !cartId
    })

    // Payment methods
    const {
        data: paymentData,
        refetch: refetchPayment,
        loading: loadingPayment
    } = useQuery(GET_AVAILABLE_PAYMENT, {
        variables: { cartId },
        skip: !cartId
    })

    const [email, setEmail] = useState('')
    const [addr, setAddr] = useState({
        firstname: 'Dipak',
        lastname: 'Patel',
        street: ['123 Main St'],
        city: 'City',
        region: 'CA',
        postcode: '90001',
        country_code: 'US',
        telephone: '555-555-5555'
    })

    // User selections
    const shippingOptions = useMemo(
        () => shippingData?.cart?.shipping_addresses?.[0]?.available_shipping_methods ?? [],
        [shippingData]
    )
    const [selectedShipping, setSelectedShipping] = useState(null)

    const paymentOptions = useMemo(
        () => paymentData?.cart?.available_payment_methods ?? [],
        [paymentData]
    )
    const [selectedPayment, setSelectedPayment] = useState(null)

    // Auto-select the first available option when they load
    useEffect(() => {
        if (!selectedShipping && shippingOptions.length > 0) {
            setSelectedShipping({
                carrier_code: shippingOptions[0].carrier_code,
                method_code: shippingOptions[0].method_code
            })
        }
    }, [shippingOptions, selectedShipping])

    useEffect(() => {
        if (!selectedPayment && paymentOptions.length > 0) {
            setSelectedPayment({ code: paymentOptions[0].code })
        }
    }, [paymentOptions, selectedPayment])

    const [setGuestEmail] = useMutation(SET_GUEST_EMAIL)
    const [setShippingAddress] = useMutation(SET_SHIPPING_ADDRESS)
    const [setShippingMethod] = useMutation(SET_SHIPPING_METHOD)
    const [setBillingAddress] = useMutation(SET_BILLING_ADDRESS)
    const [setPaymentMethod] = useMutation(SET_PAYMENT_METHOD)
    const [placeOrder, { loading: placing }] = useMutation(PLACE_ORDER)
    const [createEmptyCart] = useMutation(CREATE_EMPTY_CART)

    if (!cartId) return <div className="container"><p>No cart found.</p></div>

    const submit = async () => {
        if (!email) return alert('Please provide an email')

        // 1) Email + shipping/billing address
        await setGuestEmail({ variables: { cartId, email } })
        await setShippingAddress({ variables: { cartId, address: { address: addr } } })

        // 2) Refresh shipping methods (they depend on shipping address)
        await refetchShipping()
        const chosenShipping = selectedShipping || (shippingOptions[0] ? {
            carrier_code: shippingOptions[0].carrier_code,
            method_code: shippingOptions[0].method_code
        } : null)
        if (!chosenShipping) return alert('No shipping methods available')

        await setShippingMethod({
            variables: {
                cartId,
                carrierCode: chosenShipping.carrier_code,
                methodCode: chosenShipping.method_code
            }
        })

        // 3) Billing (same as shipping for simplicity)
        await setBillingAddress({
            variables: { cartId, address: { same_as_shipping: true, address: addr } }
        })

        // 4) Refresh payment methods (most backends require shipping method first)
        await refetchPayment()
        const chosenPayment = selectedPayment || (paymentOptions[0] ? { code: paymentOptions[0].code } : null)
        if (!chosenPayment) return alert('No payment methods available')

        await setPaymentMethod({ variables: { cartId, code: chosenPayment.code } })

        // 5) Place order
        const res = await placeOrder({ variables: { cartId } })
        const orderNumber = res?.data?.placeOrder?.order?.order_number

        if (!orderNumber) {
            alert('Order placement failed. No order number returned.')
            return
        }

        // Snapshot basic confirmation data BEFORE clearing the cart
        const grand = cartData?.cart?.prices?.grand_total
        const totalDisplay = grand ? `${grand.value} ${grand.currency}` : null

        // 6) Reset cart: clear current and create a fresh one
        try {
            clearCart()
            const newCartRes = await createEmptyCart()
            const newCartId = newCartRes?.data?.createEmptyCart
            if (newCartId) setCartId(newCartId)
        } catch (e) {
            // Even if creating a new cart fails, we still move to confirmation page
            // so the user sees the success message.
            console.error('Failed to create a new cart id', e)
        }

        // 7) Navigate to confirmation page
        navigate(`/order-confirmation/${orderNumber}`, {
            state: {
                orderNumber,
                email,
                total: totalDisplay
            },
            replace: true
        })
    }

    const grand = cartData?.cart?.prices?.grand_total

    return (
        <div className="container">
            <h2 className="link-muted" style={{ marginTop: 10 }}>Checkout</h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 md:grid-cols-12 lg:grid-cols-12" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="card col-span-1" style={{ padding: 16 }}>
                    <h3>Contact</h3>
                    <input
                        className="checkout-boxes"
                        placeholder="Email address"
                        style={{ width: '100%', padding: 10, marginTop: 8 }}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <h3 style={{ marginTop: 18 }}>Shipping address</h3>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <input className="checkout-boxes" value={addr.firstname} onChange={e => setAddr({ ...addr, firstname: e.target.value })} placeholder="First name" />
                        <input className="checkout-boxes" value={addr.lastname} onChange={e => setAddr({ ...addr, lastname: e.target.value })} placeholder="Last name" />
                    </div>
                    <input className="checkout-boxes" value={addr.street[0]} onChange={e => setAddr({ ...addr, street: [e.target.value] })} placeholder="Street" style={{ width: '100%' }} />
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <input className="checkout-boxes" value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} placeholder="City" />
                        <input className="checkout-boxes" value={addr.region} onChange={e => setAddr({ ...addr, region: e.target.value })} placeholder="Region" />
                        <input className="checkout-boxes" value={addr.postcode} onChange={e => setAddr({ ...addr, postcode: e.target.value })} placeholder="Postcode" />
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <input className="checkout-boxes" value={addr.country_code} onChange={e => setAddr({ ...addr, country_code: e.target.value })} placeholder="Country code" />
                        <input className="checkout-boxes" value={addr.telephone} onChange={e => setAddr({ ...addr, telephone: e.target.value })} placeholder="Telephone" />
                    </div>

                    <h3 style={{ marginTop: 18 }}>Shipping method</h3>
                    {loadingShipping && <p>Loading shipping methods…</p>}
                    {!loadingShipping && shippingOptions.length === 0 && <p>No shipping methods yet. Enter address and try again.</p>}
                    {shippingOptions.length > 0 && (
                        <select
                            className="checkout-boxes"
                            value={selectedShipping ? `${selectedShipping.carrier_code}:${selectedShipping.method_code}` : ''}
                            onChange={e => {
                                const [carrier_code, method_code] = e.target.value.split(':')
                                setSelectedShipping({ carrier_code, method_code })
                            }}
                            style={{ width: '100%' }}
                        >
                            {shippingOptions.map(m => (
                                <option key={`${m.carrier_code}:${m.method_code}`} value={`${m.carrier_code}:${m.method_code}`}>
                                    {m.method_title} — {m.amount?.value} {m.amount?.currency}
                                </option>
                            ))}
                        </select>
                    )}

                    <h3 style={{ marginTop: 18 }}>Payment method</h3>
                    {loadingPayment && <p>Loading payment methods…</p>}
                    {!loadingPayment && paymentOptions.length === 0 && <p>No payment methods yet. Select shipping and try again.</p>}
                    {paymentOptions.length > 0 && (
                        <select
                            className="checkout-boxes"
                            value={selectedPayment ? selectedPayment.code : ''}
                            onChange={e => setSelectedPayment({ code: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {paymentOptions.map(p => (
                                <option key={p.code} value={p.code}>{p.title || p.code}</option>
                            ))}
                        </select>
                    )}

                    <button className="btn" onClick={submit} disabled={placing} style={{ marginTop: 14 }}>
                        {placing ? 'Placing order…' : 'Place order'}
                    </button>
                </div>

                <div className="card col-span-1" style={{ padding: 16 }}>
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
                        <div style={{ color: 'var(--text)' }}>Total</div>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>
                            {grand?.value} {grand?.currency}
                        </div>
                    </div>
                    <p style={{ color: 'var(--text)' }}>
                        Choose shipping and payment methods above before placing your order.
                    </p>
                </div>
            </div>

            <div className="bg">
                <div className="grid">
                    <h1 className="text-3xl font-bold underline">
                        Hello world!
                    </h1>
                </div>
                <div className="grid">
                    Dipak
                </div>
            </div>
        </div>
    )
}