// JavaScript
import { gql } from '@apollo/client'

export const GET_PRODUCT = gql`
    query GetProduct($urlKey: String!) {
        products(filter: { url_key: { eq: $urlKey } }, pageSize: 1) {
            items {
                uid
                name
                sku
                url_key
                description { html }
                small_image { url }
                media_gallery {
                    url
                    label
                }
                price_range {
                    minimum_price {
                        final_price { value currency }
                    }
                }
                stock_status
            }
        }
    }
`


export const GET_PRODUCTS = gql`
    query GetProducts($pageSize: Int = 12, $currentPage: Int = 1) {
        products(
            filter: { price: { from: "0" } }
            pageSize: $pageSize
            currentPage: $currentPage
        ) {
            items {
                uid
                name
                sku
                url_key
                small_image { url }
                price_range {
                    minimum_price {
                        final_price { value currency }
                    }
                }
            }
            page_info { current_page page_size total_pages }
            total_count
        }
    }
`

export const GET_CART_SUMMARY = gql`
    query GetCartSummary($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            total_quantity
            prices {
                grand_total { value currency }
            }
            items {
                id
                quantity
                product {
                    name
                    small_image { url }
                    sku
                }
                prices {
                    row_total { value currency }
                }
            }
        }
    }
`

// NEW: products by category UID
export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory(
    $categoryUid: String!
    $pageSize: Int = 12
    $currentPage: Int = 1
  ) {
    products(
      filter: { category_uid: { eq: $categoryUid } }
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      items {
        uid
        name
        sku
        url_key
        small_image { url }
        price_range {
          minimum_price {
            final_price { value currency }
          }
        }
      }
      page_info { current_page page_size total_pages }
      total_count
    }
  }
`

export const GET_TOP_CATEGORIES = gql`
  query GetTopCategories {
    categories(filters: { parent_id: { eq: "2" } }) {
      items {
        uid
        name
        url_path
        children {
          uid
          name
          url_path
          children {
            uid
            name
            url_path
            children {
              uid
              name
              url_path
            }
          }
        }
      }
    }
  }
`
export const GET_PRODUCTS_BY_CATEGORYIES = gql`
  query GetProductsByCategory(
    $categoryUid: String!
    $pageSize: Int = 12
    $currentPage: Int = 1
    $search: String
  ) {
    products(
      search: $search
      filter: { category_uid: { eq: $categoryUid } }
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      items {
        uid
        name
        sku
        url_key
        small_image { url }
        price_range {
          minimum_price {
            final_price { value currency }
          }
        }
      }
      page_info { current_page page_size total_pages }
      total_count
    }
  }
`
// Lightweight global product suggestions by text search
export const GET_PRODUCT_SUGGESTIONS = gql`
  query GetProductSuggestions($q: String!, $limit: Int = 6) {
    products(search: $q, pageSize: $limit) {
      items {
        uid
        name
        url_key
        small_image { url }
        price_range {
          minimum_price {
            final_price { value currency }
          }
        }
      }
    }
  }
`
