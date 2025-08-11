import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import { GET_CATEGORIES } from '../graphql/queries'

export default function Home() {
  const { data, loading, error } = useQuery(GET_CATEGORIES, { variables: { pageSize: 12 } })

  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>

  const products = data?.products?.items ?? []

  return (
    <div style={{ padding: 16 }}>
      <h2>New Products</h2>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {products.map(p => (
          <Link key={p.uid} to={`/product/${p.url_key}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
              {p.small_image?.url && <img src={p.small_image.url} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
              <div style={{ marginTop: 8 }}>{p.name}</div>
              <div style={{ fontWeight: 600 }}>
                {p.price_range?.minimum_price?.final_price?.value} {p.price_range?.minimum_price?.final_price?.currency}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}