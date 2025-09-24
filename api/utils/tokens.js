import { timingSafeEqual } from 'crypto'
import Session from '../db/models/Session'

// TODO change signature storage (add initial secret password)
const SECRET = process.env.SECRET || (() => { throw 'Secret is undefined' })()

const getNow = () => Math.floor(new Date().getTime() / 60000)

const getMediaToken = (groupId, unixMinute) => {
    if(unixMinute === undefined) unixMinute = getNow()
    const payload = `${groupId}:${unixMinute}:${SECRET}`
    const hash = new Bun.CryptoHasher("sha256").update(payload).digest("hex")
    return `${groupId}-${unixMinute}-${hash.slice(0, 32)}`
}

const verifyMediaToken = (token, groupId) => {
    const [ _groupId, _unixMinute, _signature ] = token.split('-')
    if(_signature?.length !== 32 || !Number(_unixMinute)) return false
    const now = getNow()
    if(now - _unixMinute > 2) return false
    const _token = getMediaToken(groupId, _unixMinute)
    return safeEqual(token, _token)
    // timing attack fixed (?)
}

const safeEqual = (a, b) => {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

// TODO limit cache
const sigCache = new Map()

const cleaner = () => {
    const now = Math.floor(Date.now() / 60000)
    
    for(const [ key, [sig, expiresAt] ] of sigCache) {
        if(expiresAt < now) sigCache.delete(key)
    }
}
setInterval(cleaner, 60000)

/*
// Verify custom token
*/
function verify(token) {
    const [ payload, expiresAt, signature ] = token.split(".")
    
    return _verify(payload, expiresAt, signature)
}

function _verify(payload, expiresAt, signature) {
    if(Date.now() / 60000 > Number(expiresAt)) return null
    
    const fullPayload = `${payload}.${expiresAt}`
    console.log(fullPayload)
    
    const cachedSig = sigCache.get(fullPayload)
    console.log(cachedSig)
    if(cachedSig) return safeEqual(cachedSig[0], signature)
    
    const notCachedSig = sign(fullPayload)
    const match = safeEqual(notCachedSig, signature)
    if(match) {
        sigCache.set(fullPayload, [ notCachedSig, Number(expiresAt) ])
        return true
    }
    else return false
}

function verifyAndExtract(token) {
    const [ a, b, c ] = token.split('.')
    if(!_verify(a, b, c)) return false
    return _extract(a, b)
}

function _extract(rawPayload, expiresAt) {
    const payload = {
        exp: expiresAt
    }
    
    rawPayload.split(",").map(entry => {
        console.log(entry)
        const [ key, value ] = entry.split(':')
        payload[key] = value;
    })
    
    return payload
}

function extract(token) {
    const [ rawPayload, expiresAt ] = token.split(".")
    
    return _extract(rawPayload, expiresAt)
}

/*
// Custom token implementation
// sha3-512 (stronger) and no JSON (faster)
*/
function getToken(payload, expiresInMinutes = 5) {
    const expiresAt = getNow() + expiresInMinutes
    
    return getTokenUntil(payload, expiresAt)
}

function getTokenUntil(payload, expiresAt) {
    const fullPayload = `${payload}.${expiresAt}`
    const cachedSig = sigCache.get(fullPayload)
    if(cachedSig) return `${fullPayload}.${cachedSig[0]}`
    
    const signature = sign(fullPayload)
    sigCache.set(fullPayload, [ signature, expiresAt ])
    
    return `${fullPayload}.${signature}`
}

function sign(fullPayload) {
    const hasher = new Bun.CryptoHasher("sha512", SECRET)
    hasher.update(fullPayload)
    return hasher.digest("base64")
}

export { getToken, getTokenUntil, extract, verify, verifyAndExtract, verifyMediaToken, getMediaToken }
