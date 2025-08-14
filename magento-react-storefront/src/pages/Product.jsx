import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { GET_PRODUCT } from '../graphql/queries'
import { ADD_PRODUCTS_TO_CART, CREATE_EMPTY_CART } from '../graphql/mutations'
import { useCartStore } from '../store/cart'
import { useState } from 'react'

export default function Product() {
    const { urlKey } = useParams()
    const { data, loading, error } = useQuery(GET_PRODUCT, { variables: { urlKey } })
    const { cartId, setCartId } = useCartStore()
    const [qty, setQty] = useState(1)
    const [createEmptyCart] = useMutation(CREATE_EMPTY_CART)
    const [addProductsToCart, { loading: adding }] = useMutation(ADD_PRODUCTS_TO_CART)

    if (loading) return <p>Loading…</p>
    if (error) return <p>Error: {error.message}</p>

    const product = data?.products?.items?.[0]
    if (!product) return <p>Not found</p>

    const handleAdd = async () => {
        let id = cartId
        if (!id) {
            const res = await createEmptyCart()
            id = res?.data?.createEmptyCart
            setCartId(id)
        }
        await addProductsToCart({
            variables: {
                cartId: id,
                cartItems: [
                    {
                        quantity: Number(qty),
                        sku: product.sku, // for simple products; for complex types, you must build the correct cart item payload
                    },
                ],
            },
            awaitRefetchQueries: true,
        })
        alert('Added to cart')
    }

    return (
        <div className="container link-muted" style={{ padding: 16 }}>
            <h1>{product.name}</h1>
            {product.media_gallery?.[0]?.url && (
                <img src={product.media_gallery[0].url} alt={product.media_gallery[0].label || product.name} width={400} />
            )}
            <div
                dangerouslySetInnerHTML={{ __html: product.description?.html || '' }}
                style={{ marginTop: 16 }}
            />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>
                {product.price_range?.minimum_price?.final_price?.value}{' '}
                {product.price_range?.minimum_price?.final_price?.currency}
            </div>
            <div style={{ marginTop: 16 }}>
                <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />
                <button onClick={handleAdd} disabled={adding} style={{ marginLeft: 8 }}>
                    {adding ? 'Adding…' : 'Add to cart'}
                </button>
            </div>
        </div>
    )
}