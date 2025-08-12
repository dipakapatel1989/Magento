// JavaScript
import { useQuery } from '@apollo/client'
import { GET_PRODUCTS } from '../graphql/queries'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { pageSize: 12, currentPage: 1 }
  })

  const products = data?.products?.items ?? []

  return (
    <div>
      <section className="hero">
        <h1>Discover Products You’ll Love</h1>
        <p>Hand-picked items. Fast checkout. Powered by Magento GraphQL.</p>
      </section>

      <div className="container">
        {loading && <p>Loading…</p>}
        {error && <p>Error: {error.message}</p>}
        {!loading && !error && (
          <div className="grid">
            {products.map(p => <ProductCard key={p.uid} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}