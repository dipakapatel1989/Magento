import { gql } from '@apollo/client'

export const GET_CATEGORIES = gql`
  query GetCategories($filters: CategoryFilterInput, $pageSize: Int = 12) {
    categories(filters: $filters) {
      items {
        uid
        name
        url_key
        url_path
        children {
          uid
          name
          url_key
          url_path
        }
      }
    }
    products(pageSize: $pageSize) {
      items {
        uid
        name
        url_key
        small_image { url }
        price_range {
          minimum_price {
            regular_price { value currency }
            final_price { value currency }
          }
        }
      }
    }
  }
`

export const GET_CATEGORY_PRODUCTS = gql`
  query GetCategoryProducts($categoryUid: String!, $pageSize: Int = 12, $currentPage: Int = 1) {
    products(
      filter: { category_uid: { eq: $categoryUid } }
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
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
      page_info { current_page page_size total_pages }
      total_count
    }
  }
`

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