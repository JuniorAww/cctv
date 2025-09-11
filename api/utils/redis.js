import redis from 'redis'

const client = redis.createClient()
await client.connect()
console.log('Redis connected')

export default client
