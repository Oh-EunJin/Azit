// API
import $axios from 'axios'

export function requestLogin ({ state }, payload) {
  console.log('requestLogin', state, payload)
  const url = '/auth/login'
  let body = payload
  return $axios.post(url, body)
}

export function requestSignUp ({state}, payload) {
  console.log('requestSignUp', state, payload)
  const url = '/users'
  let body = payload
  return $axios.post(url, body)
}

export function requestMyPage ({state}, payload) {
  console.log('requestMyPage', state, payload)
  const url = '/users/me'
  let body = payload
  return $axios.get(url, body)
}
