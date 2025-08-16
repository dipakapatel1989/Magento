// JavaScript
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './apolloClient'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Category from './pages/Category'
import OrderConfirmation from './pages/OrderConfirmation'



export default function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:urlKey" element={<Product />} />
                    <Route path="/category/:uid" element={<Category />} /> {/* NEW */}
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                </Routes>
            </BrowserRouter>
        </ApolloProvider>
    )
}