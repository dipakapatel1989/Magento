// JavaScript: src/pages/Category.jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { GET_PRODUCTS_BY_CATEGORYIES } from '../graphql/queries'
import ProductCard from '../components/ProductCard'

export default function Category() {
    const { uid } = useParams()

    const [term, setTerm] = useState('')
    const [appliedTerm, setAppliedTerm] = useState('')

    // Debounce search term
    useEffect(() => {
        const t = setTimeout(() => setAppliedTerm(term.trim()), 300)
        return () => clearTimeout(t)
    }, [term])

    const variables = useMemo(() => ({
        categoryUid: uid,
        pageSize: 12,
        currentPage: 1,
        // Pass undefined when empty so Magento ignores the argument
        search: appliedTerm || undefined
    }), [uid, appliedTerm])

    const { data, loading, error } = useQuery(GET_PRODUCTS_BY_CATEGORYIES, {
        variables,
        skip: !uid
    })

    const products = data?.products?.items ?? []
    const total = data?.products?.total_count ?? 0

    return (
        <div className="container">
            <div className="section-header">
                <h1 className="section-title">Category</h1>
                <Link to="/" className="link-muted">Back to home</Link>
            </div>

            <div className="toolbar">
                <label className="sr-only link-muted" htmlFor="cat-search">Search in category</label>
                <div className="input-group">
                    <input
                        id="cat-search"
                        type="search"
                        className="input"
                        placeholder="Search in this category…"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                    {/*{term && (*/}
                    {/*    <button*/}
                    {/*        className="btn btn--ghost"*/}
                    {/*        onClick={() => setTerm('')}*/}
                    {/*        aria-label="Clear search"*/}
                    {/*    >*/}
                    {/*        ×*/}
                    {/*    </button>*/}
                    {/*)}*/}
                </div>
                <div className="results-meta">
                    {loading ? 'Searching…' : `Results: ${total}`}
                </div>
            </div>

            {loading && <p>Loading…</p>}
            {error && <p>Error: {error.message}</p>}

            {!loading && !error && (
                products.length ? (
                    <div className="grid grid--products">
                        {products.map(p => <ProductCard key={p.uid} product={p} />)}
                    </div>
                ) : (
                    <p>No products found{appliedTerm ? ` for “${appliedTerm}”` : ''} in this category.</p>
                )
            )}
        </div>
    )
}