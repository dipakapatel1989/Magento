// JavaScript
import { useQuery } from '@apollo/client'
import { GET_PRODUCTS, GET_TOP_CATEGORIES } from '../graphql/queries'
import ProductCard from '../components/ProductCard'
import { Link } from 'react-router-dom'

export default function Home() {
    const { data: prodData, loading, error } = useQuery(GET_PRODUCTS, {
        variables: { pageSize: 12, currentPage: 1 }
    })

    const { data: catData } = useQuery(GET_TOP_CATEGORIES)
    const products = prodData?.products?.items ?? []
    const topCats = (catData?.categories?.items ?? []).slice(0, 8)

    return (
        <div>
            <div className="container">
                <section className="hero--home">
                    <div className="hero-content">
                        <h1 className="link-muted">Discover Products You’ll Love</h1>
                        <p className="link-muted">Hand-picked items. Fast checkout. Powered by Magento GraphQL.</p>

                        <div className="hero-actions">
                            <input
                                type="search"
                                className="input"
                                placeholder="Search for products…"
                                aria-label="Search products"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        // Replace with your search route
                                        window.location.href = `/search?q=${encodeURIComponent(e.currentTarget.value)}`
                                    }
                                }}
                            />
                            <Link to="/category/all" className="btn">Shop all</Link>
                        </div>

                        {/*{!!topCats.length && (*/}
                        {/*    <div className="chips">*/}
                        {/*        {topCats.map(cat => (*/}
                        {/*            console.log(cat),*/}
                        {/*            <Link key={cat.uid} to={`/category/${cat.uid}`} className="chip">*/}
                        {/*                {cat.name}*/}
                        {/*            </Link>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>

                </section>


                <div className="section-header">
                    <h2 className="section-title link-muted">Featured products</h2>
                    <Link to="/category/all" className="link-muted">View all</Link>
                </div>

                {loading && <p>Loading…</p>}
                {error && <p>Error: {error.message}</p>}

                {!loading && !error && (
                    <div className="grid grid--products">
                        {products.map(p => <ProductCard key={p.uid} product={p} />)}
                    </div>
                )}
            </div>
        </div>
    )
}