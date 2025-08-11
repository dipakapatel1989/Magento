import { gql } from '@apollo/client'

export const CREATE_EMPTY_CART = gql`
  mutation CreateEmptyCart {
    createEmptyCart
  }
`

export const ADD_PRODUCTS_TO_CART = gql`
  mutation AddProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(
      cartId: $cartId
      cartItems: $cartItems
    ) {
      cart {
        id
        total_quantity
        prices {
          grand_total { value currency }
        }
        items {
          id
          quantity
          product {
            uid
            name
            small_image { url }
            price_range {
              minimum_price {
                final_price { value currency }
              }
            }
          }
        }
      }
    }
  }
`

export const SET_GUEST_EMAIL = gql`
  mutation SetGuestEmail($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart { id }
    }
  }
`

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddressesOnCart($cartId: String!, $address: ShippingAddressInput!) {
    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [$address]
      }
    ) {
      cart { id }
    }
  }
`

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethodsOnCart($cartId: String!, $carrierCode: String!, $methodCode: String!) {
    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: [{ carrier_code: $carrierCode, method_code: $methodCode }]
      }
    ) {
      cart { id }
    }
  }
`

export const SET_BILLING_ADDRESS = gql`
  mutation SetBillingAddressOnCart($cartId: String!, $address: BillingAddressInput!) {
    setBillingAddressOnCart(input: { cart_id: $cartId, billing_address: $address }) {
      cart { id }
    }
  }
`

export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethodOnCart($cartId: String!, $code: String!) {
    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $code } }) {
      cart { id }
    }
  }
`

export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
    }
  }
`