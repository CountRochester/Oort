import Messenger from '@/utils/messenger'
import keys from '../server/keys'
// import os from 'os'
// import { gql } from 'apollo-server-express'

// const HOSTNAME = '192.168.40.63'
// const PORT = '80'

export async function gQLRequest (query) {
  try {
    return Object.values(await gQLRawRequest(query))[0]
  } catch (err) {
    throw err
  }
}

export async function gQLRawRequest (query, variables) {
  try {
    const messenger = Messenger.getInstance()
    const url = process.browser
      ? '/graphql'
      // : `http://${HOSTNAME}:${PORT}/graphql`
      : `http://${keys.APOLLO_HOST}:${process.env.APP_PORT || 3000}/graphql`
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      // body: JSON.stringify({ query: gql`${query}` })
      body: JSON.stringify({ query, variables })
    })
    const res = await response.json()
    if (res === '{"access":"denied"}') {
      await window.$nuxt.$store.dispatch('auth/logout')
      window.location.replace('/auth/login?message=login')
    } else if (res) {
      const resArray = Object.values(res.data)
      resArray.forEach((el) => {
        if (el) {
          messenger.addMessage({
            funcType: el.type,
            result: el.messageType,
            text: el.text,
            id: el.id,
            item: el.item
          })
        }
      })
    }

    return res.data
  } catch (err) {
    throw err
  }
}

export async function loginRequest (app, query) {
  try {
    const message = Object.values(await gQLRawRequest(query))[0]
    if (message.messageType === 'success') {
      if (message.token) {
        console.log('Login message:')
        console.log(message)
        await app.$store.dispatch('auth/setToken', message.token)
        await app.$store.dispatch('auth/setUser', message.UserId)
      }
      app.$toast.success(message.text)
    } else {
      app.$toast.error(message.text)
    }
  } catch (err) {
    throw err
  }
}

export async function gQLRequestMessage (app, query, variables) {
  try {
    const response = await gQLRawRequest(query, variables)
    const resArray = Object.values(response)
    const ids = []
    if (resArray.length) {
      for (const item of resArray) {
        if (item.messageType === 'success') {
          // app.$toast.success(item.text)
          if (item.id) {
            ids.push(item.id)
          }
        } else {
          // app.$toast.error(item.text)
        }
      }
    }
    return ids
  } catch (err) {
    throw err
  }
}
