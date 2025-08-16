// JavaScript
import { Link, useLocation, useParams } from 'react-router-dom'

export default function OrderConfirmation() {
    const { orderNumber: orderParam } = useParams()
    const location = useLocation()
    const state = location.state || {}

    const orderNumber = state.orderNumber || orderParam
    const email = state.email || 'your email'
    const total = state.total || null

    return (
        <div className="container">
            <div className="card" style={{ padding: 24, maxWidth: 720, margin: '24px auto' }}>
                <h2 style={{ marginBottom: 12 }}>Thank you for your order!</h2>
                <p style={{ marginBottom: 8 }}>
                    Your order has been placed successfully.
                </p>

                <div style={{ marginTop: 16 }}>
                    <div style={{ margin: '8px 0' }}>
                        <strong>Order number:</strong> {orderNumber || 'N/A'}
                    </div>
                    <div style={{ margin: '8px 0' }}>
                        <strong>Confirmation sent to:</strong> {email}
                    </div>
                    {total && (
                        <div style={{ margin: '8px 0' }}>
                            <strong>Order total:</strong> {total}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 24 }}>
                    <Link to="/" className="btn">Continue shopping</Link>
                </div>
            </div>
        </div>
    )
}