require('dotenv').config()
const fetch = require('node-fetch')
const newHashtagsManager = require('./newHashtagsManager')
const T = require('./twit')

const tweetFrequency = 60 * 15 // Once every 15min is the twitter rate limit

// Twitter seems to update the hashtags json every hour
setInterval(checkNewHashtags, 60 * 60 * 1000)
setInterval(tweet, tweetFrequency * 1000)
checkNewHashtags().then(() => {
  if (process.env.NODE_ENV !== 'production') tweet()
})

async function checkNewHashtags() {
  try {
    const d = new Date()
    const urlDatePart = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${d.getUTCHours()}`
    const jsonUrl = `https://pbs.twimg.com/hashflag/config-${urlDatePart}.json`
    const res = await fetch(jsonUrl).then(r => r.json())
    newHashtagsManager.updateList(res)
  } catch (e) {
    console.error(e)
  }
}

async function tweet() {
  let newHashtag
  try {
    newHashtag = await newHashtagsManager.getNewHashtag()
  } catch (e) {
    console.error(e)
  }
  if (!newHashtag) return
  const hashtagDescription = newHashtag.campaignName.replace(/_/g, ' ')
  const params = { status: `New branded hashtag: #${newHashtag.hashtag} (${hashtagDescription})` }
  try {
    await T.post('statuses/update', params)
  } catch (err) {
    console.error('[tweet] error tweeting: ', err)
  }
}
