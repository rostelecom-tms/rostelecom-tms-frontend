import axios from 'axios'
import constants from '../utils/constants.ts'

export const api = axios.create({
    baseURL: constants.API_URL
})
