import Axios from "axios"
import { setupCache } from "axios-cache-adapter"

const cache = setupCache({
  maxAge: 30000,
  clearOnStale: false,
  clearOnError: false,
  readHeaders: false,
  exclude: {
    query: false,
    methods: ["post", "patch", "put", "delete"],
  },
})

const axios = Axios.create({
  adapter: cache.adapter,
})

export default axios
