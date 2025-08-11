import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_MAGENTO_GRAPHQL_ENDPOINT || '/graphql',
})

const authLink = setContext((_, { headers }) => {
  // Optionally add a customer token for logged in users
  const token = localStorage.getItem('customerToken') // set via generateCustomerToken
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})