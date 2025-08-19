// JavaScript
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { ADD_PRODUCTS_TO_CART, CREATE_EMPTY_CART } from '../graphql/mutations'
import { GET_CART_SUMMARY } from '../graphql/queries'
import { useCartStore } from '../store/cart'
import { useState } from 'react'
import ColorOptions from './ColorOptions'

export default function ProductCard({ product }) {
    const { cartId, setCartId } = useCartStore()
    const [qty, setQty] = useState(1)
    const [createEmptyCart, { loading: creatingCart }] = useMutation(CREATE_EMPTY_CART)
    const [addProductsToCart, { loading: addingToCart }] = useMutation(ADD_PRODUCTS_TO_CART)

    const add = async () => {
        // Clamp to a minimum of 1 and ensure it’s a number
        const parsed = parseInt(qty, 10)
        const quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1

        try {
            let id = cartId
            if (!id) {
                const res = await createEmptyCart()
                id = res?.data?.createEmptyCart
                if (!id) throw new Error('Failed to create cart')
                setCartId(id)
            }

            await addProductsToCart({
                variables: {
                    cartId: id,
                    cartItems: [{ quantity, sku: product.sku }]
                },
                // Ensure header badge updates immediately after add
                refetchQueries: [{ query: GET_CART_SUMMARY, variables: { cartId: id } }],
                awaitRefetchQueries: true
            })
        } catch (err) {
            console.error('Add to cart failed:', err)
            alert(err?.message || 'Add to cart failed. Please try again.')
        }
    }

    const price = product.price_range?.minimum_price?.final_price
    const img = product.small_image?.url
    const disabled = creatingCart || addingToCart

    // Pull color options if the product is configurable
    const isConfigurable = product.__typename === 'ConfigurableProduct'
    const colorOption = isConfigurable
        ? product.configurable_options?.find(o => o.attribute_code === 'color')
        : null

    return (
        <div className="card">
            <Link to={`/product/${product.url_key}`} style={{ display: 'block' }}>
                <img className="card-img" src={img} alt={product.name} />
            </Link>
            <div className="card-body">
                <div className="title">{product.name}</div>
                {isConfigurable && !!colorOption?.values?.length && (
                    <ColorOptions values={colorOption.values} />
                )}
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }}>
                    <div className="price">
                        {price?.value} {price?.currency}
                    </div>
                    <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="subtle link-muted"
                        style={{ width: 70, textAlign: 'center' }}
                    />
                </div>
                <button className="btn" onClick={add} disabled={disabled}>
                    {disabled ? 'Adding…' : 'Add to cart'}
                </button>
            </div>
        </div>
    )
}