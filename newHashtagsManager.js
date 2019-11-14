const T = require('./twit')

let hashtagsList = {}
const debugAlreadyTweeted = new Set()

module.exports.updateList = newList => {
  // Sort by starting timestamp descending
  hashtagsList = newList.sort((a, b) => {
    if (a.startingTimestampMs > b.startingTimestampMs) return -1
    if (a.startingTimestampMs < b.startingTimestampMs) return 1
    return 0
  })
}

module.exports.getNewHashtag = async () => {
  if (Object.keys(hashtagsList).length === 0) throw new Error('Empty hashtags list')

  const lastHashtag = await getLastHashtagTweeted()
  let lastHashtagIndex = hashtagsList.findIndex(h => h.hashtag === lastHashtag)
  if (lastHashtagIndex === -1) {
    console.warn('Last hashtag not found in hashtags list. Restarting from newest hashtag')
    lastHashtagIndex = hashtagsList.length - 2
  }
  const nextHashtagIndex = lastHashtagIndex + 1
  if (nextHashtagIndex > hashtagsList.length - 1) {
    // We finished the list
    return false
  }
  const nextHashtag = hashtagsList[nextHashtagIndex]

  // debug code to find duplicates
  if (debugAlreadyTweeted.has(nextHashtag.hashtag)) {
    console.debug(`Duplicate tweet found: ${nextHashtag.hashtag}`)
  } else {
    debugAlreadyTweeted.add(nextHashtag.hashtag)
  }

  return nextHashtag
}

async function getLastHashtagTweeted() {
  const tweets = (await T.get('statuses/user_timeline', {
    include_rts: false,
    count: 10,
    trim_user: true,
    exclude_replies: true,
  })).data
  if (!tweets || !tweets.length) {
    throw new Error('No tweets found. Please send a tweet with a hashtag to kickstart the bot')
  }
  const lastTweet = tweets.find(tweet => tweet.entities.hashtags.length)
  if (!lastTweet) {
    throw new Error('No hashtags found in the last 10 tweets. Please send a tweet with a hashtag to kickstart the bot')
  }
  const lastTweetHashtag = lastTweet.entities.hashtags[0].text
  return lastTweetHashtag
}
