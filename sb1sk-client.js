import dotenv from 'dotenv'

dotenv.config()

const bankShortName = 'smn'
const userName = process.env.SB1SK_USERNAME;
const password = process.env.SB1SK_PASSWORD;

const SB1SK_CLIENT_KEY = process.env.SB1SK_CLIENT_KEY;

const fetchSb1skToken = async () => {
    const requestHeaders =  {
        Accept: 'application/vnd.sb1sk-v1+json; charset=UTF-8',
        'Content-Type': 'application/vnd.sb1sk-v1+json',
        'Application-Token': SB1SK_CLIENT_KEY,
    }

    const rawBody = JSON.stringify({
        channel: 'OFFICE',
        financialInstitution: {
            type: 'SB1SK-Domain',
            value: bankShortName,
        },
        username: userName,
        password: password,
        clientOptions: {
            realm: 'kontor',
        },
    })

    const requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: rawBody,
        redirect: 'follow',
    }

    const result = await fetch(
        'https://api-sb1sk-prodlik.test.sparebank1.no/login/password',
        requestOptions
    )

    const json = await result.json()
    return json.sessionData.singleSignonToken
}


let cachedSb1skToken = 'not-fetched-yet'
let lastRefresh = new Date(1970, 1, 1).getTime()

const TOKEN_LIFETIME = 8 * 60 * 60 * 1000 // 8 hours
const CLOCK_SKEW = 5 * 60 * 1000 // 5 min
let currentFetch = undefined



export const autoLogon = async () => {
    if (currentFetch) {
        await currentFetch
    }

    const attemptedTime = new Date().getTime()
    if (attemptedTime - lastRefresh > TOKEN_LIFETIME - CLOCK_SKEW) {

        currentFetch = fetchSb1skToken()
            .then((newToken) => {
                cachedSb1skToken = newToken
                lastRefresh = attemptedTime
                currentFetch = undefined
            })
        await currentFetch
    }

    return cachedSb1skToken
}