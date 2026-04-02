export interface TwitterPost {
  displayName: string;
  handle: string;
  text: string;
  verified: boolean;
  likes: string;
  retweets: string;
  time: string;
  hasMedia?: boolean;
}

export interface InstagramPost {
  username: string;
  likes: string;
  caption: string;
  time: string;
}

export interface YouTubeVideo {
  title: string;
  channel: string;
  views: string;
  time: string;
  duration: string;
}

export interface TikTokPost {
  username: string;
  description: string;
  likes: string;
  sound: string;
}

// ── TWITTER POSTS BY TIER ──

const twitterTier0: TwitterPost[] = [
  { displayName: 'Lina Khan', handle: '@linakhan', text: 'Just published our analysis of non-compete clauses and their effect on worker mobility. The data is striking — states that banned them saw 4.4% higher wage growth.', verified: true, likes: '2.1K', retweets: '487', time: '3h' },
  { displayName: 'Bret Victor', handle: '@worrydream', text: 'Found an incredible 1978 paper by Alan Kay on reactive computing environments. Many ideas we consider "modern" were already fully articulated. PDF in thread.', verified: false, likes: '891', retweets: '203', time: '5h' },
  { displayName: 'Robin Sloan', handle: '@robinsloan', text: 'The best technology disappears. You stop noticing the book, the chair, the window. You just read, sit, look. That\'s what good software should feel like.', verified: false, likes: '1.4K', retweets: '312', time: '7h' },
  { displayName: 'Molly White', handle: '@molaboratory', text: 'Updated the timeline of crypto exchange collapses through Q1 2026. The pattern of audit failures preceding each collapse is remarkably consistent.', verified: true, likes: '3.2K', retweets: '890', time: '2h' },
  { displayName: 'Dan Luu', handle: '@daboratory', text: 'Measured actual latency of 15 popular web apps vs their native equivalents. The gap has widened since 2022. Writeup with methodology on my blog.', verified: false, likes: '2.8K', retweets: '645', time: '8h' },
  { displayName: 'Anil Dash', handle: '@anildash', text: 'Thinking about how the best communities I\'ve been part of had clear, thoughtful moderation from day one. Not rules — culture.', verified: true, likes: '967', retweets: '178', time: '4h' },
  { displayName: 'Maggie Appleton', handle: '@mappletons', text: 'New essay: "The Garden and the Stream Revisited." How spatial interfaces change the way we think about knowledge.', verified: false, likes: '1.1K', retweets: '289', time: '6h' },
  { displayName: 'Matt Levine', handle: '@matt_levine', text: 'The SEC filed an enforcement action against a company whose entire business model was, essentially, regulatory arbitrage on the definition of "security." Which is a kind of poetry.', verified: true, likes: '4.5K', retweets: '1.2K', time: '1h' },
  { displayName: 'Jen Simmons', handle: '@jensimmons', text: 'CSS container queries are now supported in all major browsers. The layout possibilities this unlocks are genuinely exciting. A thread with examples →', verified: true, likes: '2.3K', retweets: '567', time: '9h' },
  { displayName: 'Craig Mod', handle: '@craigmod', text: 'Day 14 of the walk. 23km today through rice paddies and cedar forests. The rhythm of walking strips away everything unnecessary.', verified: false, likes: '789', retweets: '124', time: '11h' },
  { displayName: 'Arvind Narayanan', handle: '@random_walker', text: 'New paper: we tested 8 "AI detection" tools against student writing. False positive rates ranged from 12% to 34%. These tools are not reliable enough for any consequential decision.', verified: true, likes: '5.6K', retweets: '2.1K', time: '3h' },
  { displayName: 'Julia Evans', handle: '@b0rk', text: 'Made a zine page explaining how DNS actually works, from your browser to the root servers and back. Sometimes the basics are worth revisiting carefully.', verified: false, likes: '3.1K', retweets: '812', time: '5h' },
  { displayName: 'Sarah Jamie Lewis', handle: '@sarahjlewis', text: 'Published our audit of 6 "encrypted" messaging apps. Three of them transmitted metadata in plaintext. Encryption without metadata protection is theater.', verified: true, likes: '4.2K', retweets: '1.8K', time: '7h' },
  { displayName: 'Kelsey Hightower', handle: '@kelseyhightower', text: 'The best infrastructure is the kind your users never have to think about. If they\'re debugging your platform instead of building their product, you\'ve failed.', verified: true, likes: '2.7K', retweets: '534', time: '10h' },
  { displayName: 'Emily Short', handle: '@emshort', text: 'Reading a 1992 paper on interactive fiction design that anticipated most of the "choices in narrative" discourse we\'re having now. The field keeps rediscovering itself.', verified: false, likes: '456', retweets: '87', time: '12h' },
];

const twitterTier1: TwitterPost[] = [
  { displayName: 'Tech Insider', handle: '@techinsider', text: 'This engineer built a mass spectrometer from e-waste in his garage. The results are actually lab-grade. Full story 🧵', verified: true, likes: '12K', retweets: '3.4K', time: '1h' },
  { displayName: 'Culture Crave', handle: '@culturecrave', text: 'Apple just filed a patent that would change how we interact with screens forever. Here\'s what we know so far:', verified: true, likes: '8.9K', retweets: '2.1K', time: '45m' },
  { displayName: 'Spencer Ackerman', handle: '@atackserman', text: 'THREAD: I obtained internal Pentagon emails about the drone program that contradict everything the spokesperson said last week. Let me walk you through them.', verified: true, likes: '15K', retweets: '6.7K', time: '2h' },
  { displayName: 'Space Nerd', handle: '@spacenerdery', text: 'James Webb just captured something we\'ve never seen before in the Orion Nebula. The implications for our understanding of star formation are massive.', verified: false, likes: '22K', retweets: '5.8K', time: '3h' },
  { displayName: 'Trung Phan', handle: '@trungtphan', text: 'The story of how a $3 billion company was built because of a typo is absolutely wild. A thread 🧵👇', verified: true, likes: '9.4K', retweets: '2.8K', time: '4h' },
  { displayName: 'Jessica Lessin', handle: '@jessicalessin', text: 'SCOOP: Google is internally testing a product that could reshape the entire advertising industry. Sources say launch is weeks away.', verified: true, likes: '6.7K', retweets: '1.9K', time: '1h' },
  { displayName: 'Today Years Old', handle: '@todayyearsold', text: 'TIL that octopuses have been observed punching fish out of spite, with no food-related motivation. Sometimes they just punch.', verified: false, likes: '34K', retweets: '8.1K', time: '5h' },
  { displayName: 'Prof. Emily Lakdawalla', handle: '@elakdawalla', text: 'Mars Reconnaissance Orbiter captured what appears to be an active geological process we\'ve never documented before. Here\'s why this changes our understanding →', verified: true, likes: '11K', retweets: '3.2K', time: '6h' },
  { displayName: 'Patrick McKenzie', handle: '@paboratorio', text: 'A quick thread on why the "just use Stripe" advice works for 90% of businesses but is catastrophically wrong for the other 10%.', verified: true, likes: '7.8K', retweets: '2.3K', time: '3h' },
  { displayName: 'Science Girl', handle: '@scilosophy', text: 'Scientists just discovered a fungus that eats radiation. It was growing inside the Chernobyl reactor. 🍄☢️ A thread on what this means:', verified: false, likes: '45K', retweets: '12K', time: '2h' },
  { displayName: 'Data Is Beautiful', handle: '@dataisbeautiful', text: 'I mapped every Starbucks closing in 2026 and found a pattern nobody is talking about. The data visualization will surprise you.', verified: false, likes: '18K', retweets: '4.5K', time: '7h' },
  { displayName: 'Kara Swisher', handle: '@karaswisher', text: 'Just got off the phone with a senior exec at Meta. What they told me about the next 6 months is... interesting. Column dropping tomorrow.', verified: true, likes: '14K', retweets: '3.8K', time: '30m' },
  { displayName: 'Weird History', handle: '@weirdhistory', text: 'In 1932, Australia fought an actual war against emus. They lost. This is the real story, and it\'s wilder than you think 🧵', verified: false, likes: '67K', retweets: '19K', time: '8h' },
  { displayName: 'Naval Ravikant', handle: '@naval', text: 'The most productive people I know are the ones who say no to almost everything. Saying yes is the real time trap.', verified: true, likes: '28K', retweets: '7.2K', time: '4h' },
  { displayName: 'Internet of Bugs', handle: '@internetofbugs', text: 'Okay so I finally reverse-engineered that smart doorbell everyone\'s been asking about. The security situation is... not great. Thread with findings →', verified: false, likes: '8.3K', retweets: '2.6K', time: '5h' },
];

const twitterTier2: TwitterPost[] = [
  { displayName: 'BREAKING', handle: '@breakingnewsglb', text: '🚨 JUST IN: Major tech company reportedly preparing massive layoffs affecting 15,000+ employees. Details emerging now.', verified: true, likes: '34K', retweets: '12K', time: '12m' },
  { displayName: 'Outrage Bot', handle: '@wakeuppeople', text: 'Nobody is talking about how [COMPANY] just quietly changed their terms of service to allow THIS. Read the fine print. RT before they delete this.', verified: false, likes: '56K', retweets: '23K', time: '1h' },
  { displayName: 'Hot Take Factory', handle: '@hottakefactory', text: 'Controversial opinion: remote work is making people worse at their jobs and nobody has the courage to say it out loud.', verified: false, likes: '89K', retweets: '14K', time: '45m' },
  { displayName: 'Clout Chaser', handle: '@cloutchronicles', text: 'I said this 6 months ago and everyone called me crazy. Now look what\'s happening. Screenshot for proof 👇', verified: false, likes: '12K', retweets: '3.4K', time: '2h' },
  { displayName: 'Drama Alert', handle: '@dramaalertreal', text: 'The entire internet is about to find out what [PERSON] did. Receipts dropping in 1 hour. Set your alarms. ⏰', verified: true, likes: '78K', retweets: '34K', time: '30m' },
  { displayName: 'Ratio King', handle: '@ratioking2026', text: 'You\'re telling me we can send a car to Mars but we can\'t [COMPLETELY UNRELATED THING]?? Make it make sense.', verified: false, likes: '45K', retweets: '8.9K', time: '3h' },
  { displayName: 'Main Character', handle: '@maincharenergy', text: 'Just got recognized at the airport AGAIN. This is what happens when your tweet goes viral. Life is different now.', verified: false, likes: '2.3K', retweets: '456', time: '4h' },
  { displayName: 'Crypto Prophet', handle: '@cryptoprophet99', text: '📈 I\'ve been right about every major move this year. My next call: $BTC to $200K by September. Bookmark this. You\'ll thank me later.', verified: false, likes: '34K', retweets: '8.7K', time: '1h' },
  { displayName: 'Spicy Takes', handle: '@spicytakes', text: 'Just realized that [POPULAR THING] is actually terrible and here\'s a 15-tweet thread explaining why I\'m right and everyone else is wrong 🧵', verified: false, likes: '23K', retweets: '5.6K', time: '5h' },
  { displayName: 'Engagement Farmer', handle: '@engagementfarm', text: 'Men will literally [ABSURD THING] instead of going to therapy 😭😭😭\n\n(Like and RT if you agree)', verified: false, likes: '67K', retweets: '15K', time: '2h' },
  { displayName: 'Doom Poster', handle: '@doomposter', text: 'A thread on why the next 18 months will be the most turbulent period in modern history. Most people aren\'t prepared. 🧵⬇️', verified: false, likes: '41K', retweets: '11K', time: '6h' },
  { displayName: 'Sigma Grindset', handle: '@sigmagrindset', text: 'I wake up at 3:47 AM every day. Cold shower. 200 pushups. No breakfast. That\'s why I\'m winning and you\'re not. (thread on my routine) 💪', verified: false, likes: '28K', retweets: '6.3K', time: '3h' },
  { displayName: 'Conspiracy Corner', handle: '@conspiracycorner', text: 'Isn\'t it funny how NOBODY is asking the obvious question about [EVENT]?? The timing is suspicious. The connections are right there. Open your eyes.', verified: false, likes: '19K', retweets: '7.8K', time: '4h' },
  { displayName: 'Quote Tweet God', handle: '@qtgod', text: 'This ratio is going to be legendary. Screenshotting this for the hall of fame. Everyone get in here 🍿', verified: false, likes: '56K', retweets: '12K', time: '1h' },
  { displayName: 'Discourse Enjoyer', handle: '@discourseenjoyer', text: 'Today\'s internet argument that will consume everyone\'s attention for exactly 4 hours before being completely forgotten: [TAKES SIDE]', verified: false, likes: '34K', retweets: '7.8K', time: '2h' },
];

const twitterTier3: TwitterPost[] = [
  { displayName: '🔥 VIRAL 🔥', handle: '@viralalertss', text: 'STOP SCROLLING. You NEED to see what just happened. This will be the biggest story of 2026. I\'m literally shaking. RT NOW before they take this down.', verified: false, likes: '123K', retweets: '56K', time: '8m' },
  { displayName: 'EXPOSED', handle: '@exposed247', text: '🚨🚨🚨 BREAKING THREAD 🚨🚨🚨\n\nWhat I\'m about to reveal will shock you. They tried to silence me. They FAILED. Buckle up.\n\n1/47 🧵👇', verified: false, likes: '89K', retweets: '34K', time: '15m' },
  { displayName: 'Clout Demon', handle: '@cloutdemon', text: 'I don\'t care if this gets me cancelled. Someone needs to say it. *takes deep breath* [EXTREMELY POPULAR OPINION]', verified: false, likes: '156K', retweets: '45K', time: '1h' },
  { displayName: 'Algorithm Bait', handle: '@algorithmbait', text: 'Day 247 of posting this until it goes viral:\n\nWHO ELSE remembers when [THING EVERYONE REMEMBERS]??\n\nLike = yes\nRT = you\'re a real one', verified: false, likes: '234K', retweets: '67K', time: '30m' },
  { displayName: 'URGENT NEWS', handle: '@urgentnews24', text: '⚡⚡ DEVELOPING: Something MAJOR just happened and the mainstream media is COMPLETELY SILENT about it. Share this before they censor it. ⚡⚡', verified: false, likes: '178K', retweets: '89K', time: '5m' },
  { displayName: 'Drama Queen', handle: '@dramaqueen2026', text: 'THE INTERNET IS NOT READY FOR THIS CONVERSATION.\n\nAre you team A or team B? Wrong answers only 😈\n\nQuote tweet your take 👇', verified: false, likes: '67K', retweets: '23K', time: '45m' },
  { displayName: 'Based and Real', handle: '@basedandreal', text: 'RATIO + L + didn\'t ask + you fell off + the hood watches this account + cope + seethe + mald + 📸🤨', verified: false, likes: '145K', retweets: '34K', time: '20m' },
  { displayName: 'Prophecy Account', handle: '@prophecyaccount', text: 'I predicted this EXACTLY 3 months ago. Screenshot proof below. My followers know. The rest of you are just now catching up. Wake up. 🔮', verified: false, likes: '78K', retweets: '19K', time: '2h' },
  { displayName: 'SHOCK CONTENT', handle: '@shockcontent', text: 'JUST WATCHED THIS 47 TIMES IN A ROW AND I STILL CAN\'T BELIEVE IT\'S REAL 😱😱😱😱😱\n\nThe internet is BROKEN rn', verified: false, likes: '234K', retweets: '78K', time: '10m' },
  { displayName: 'Rage Bait Pro', handle: '@ragebaitpro', text: 'IF YOU DON\'T RETWEET THIS YOU\'RE PART OF THE PROBLEM\n\n[screenshot of something designed to make you angry]\n\nWe need to talk about this. NOW.', verified: false, likes: '156K', retweets: '67K', time: '1h' },
  { displayName: 'Main Character Arc', handle: '@maincharacterarc', text: 'okay so this person just PUBLICLY DESTROYED their career in real time and I have all the screenshots. get comfortable because this is INSANE 🧵👇', verified: false, likes: '189K', retweets: '56K', time: '25m' },
  { displayName: 'Engagement Demon', handle: '@engagementdemon', text: 'Like this tweet if you\'re still awake 🌙\nRetweet if you can\'t sleep 😴\nReply with your zodiac sign ♈\nFollow for a follow back 🔄\n\nLET\'S GO VIRAL 🚀', verified: false, likes: '345K', retweets: '123K', time: '3h' },
  { displayName: 'Conspiracy Max', handle: '@conspiracymax', text: 'THEY DON\'T WANT YOU TO SEE THIS.\n\nI\'ve connected ALL the dots. Every. Single. One.\n\nThis thread will change how you see EVERYTHING.\n\nRetweet before they delete my account.', verified: false, likes: '98K', retweets: '45K', time: '40m' },
  { displayName: 'Unhinged Daily', handle: '@unhingeddaily', text: 'I\'m going to say something that will get me on a list but SOMEBODY has to say it\n\n*inhales*\n\n[INCREDIBLY MUNDANE OPINION ABOUT PIZZA TOPPINGS]', verified: false, likes: '267K', retweets: '78K', time: '15m' },
  { displayName: 'BREAKING DRAMA', handle: '@breakingdrama', text: '🔴 LIVE THREAD 🔴\n\nThis is happening RIGHT NOW. I\'m updating in real time. Do NOT leave this thread.\n\nLike for notifications.\n\n1/', verified: false, likes: '134K', retweets: '56K', time: '2m' },
];

const twitterTier4: TwitterPost[] = [
  { displayName: '💀BRAIN ROT💀', handle: '@brainrot247', text: 'I literally cannot believe what I just saw 😱😱😱 THIS CHANGES EVERYTHING no cap fr fr the simulation is BROKEN the matrix is GLITCHING 🤯🤯🤯🤯', verified: false, likes: '567K', retweets: '234K', time: '1m' },
  { displayName: 'AAAAAAAAA', handle: '@aaaaaaaaa', text: 'AHHHHHHHHH THIS IS THE TWEET. THIS IS THE ONE. IF YOU\'RE SEEING THIS IT\'S YOUR SIGN. SHARE OR 7 YEARS BAD LUCK 🍀💀🔥😱', verified: false, likes: '890K', retweets: '345K', time: '3m' },
  { displayName: 'Serotonin Dealer', handle: '@serotonindealr', text: 'POV: you\'re doomscrolling at 3am and you found this tweet\n\nCongrats you\'re now cursed\n\nLike in 5 seconds or else 👁️👄👁️\n\n🔄 RT for good vibes', verified: false, likes: '456K', retweets: '189K', time: '2m' },
  { displayName: 'CHAOS AGENT', handle: '@chaosagent', text: 'this app is UNHINGED rn LMAOOOOO 💀💀💀\n\nevery single tweet on my timeline is absolute CARNAGE\n\ni love the internet so much\n\nRATIO EVERYONE BELOW ME', verified: false, likes: '678K', retweets: '234K', time: '5m' },
  { displayName: 'NPC BEHAVIOR', handle: '@npcbehavior', text: 'bro just did the CRAZIEST thing I\'ve ever seen in my LIFE and I\'ve been on this app for 11 years 😭😭😭😭😭 internet is UNDEFEATED fr 💀💀💀', verified: false, likes: '345K', retweets: '123K', time: '4m' },
  { displayName: 'MAXIMUM COPE', handle: '@maximumcope', text: 'LMAOOOOO THEY REALLY DID IT 💀💀💀\n\nI\'m SCREAMING\nI\'m CRYING\nI\'m SHAKING\nI\'m literally on the FLOOR\n\nThis timeline is the GREATEST SHOW ON EARTH 🎪🤡', verified: false, likes: '789K', retweets: '345K', time: '1m' },
  { displayName: 'Dopamine Hit', handle: '@dopaminehit', text: 'QUICK SCROLL BACK UP ⬆️ YOU MISSED SOMETHING\n\njk but now that I have your attention\n\nFOLLOW ME FOR DAILY BRAIN DAMAGE 🧠💥\n\n🔄🔄🔄🔄🔄', verified: false, likes: '234K', retweets: '89K', time: '6m' },
  { displayName: '3AM THOUGHTS', handle: '@3amthoughts', text: 'what if we\'re all just NPCs in someone else\'s doomscroll 🤔\n\nlike this tweet if you\'re sentient\nignore if you\'re a bot\nRT if reality is a simulation\n\n💀💀💀💀💀💀💀', verified: false, likes: '567K', retweets: '234K', time: '3m' },
  { displayName: 'CONTENT GOBLIN', handle: '@contentgoblin', text: 'I HAVE BEEN AWAKE FOR 37 HOURS AND I JUST SAW THE FUNNIEST THING EVER CREATED BY HUMAN HANDS\n\nMY LAST 3 BRAIN CELLS ARE FIGHTING FOR SURVIVAL\n\n😭😭😭😭😭😭😭😭', verified: false, likes: '890K', retweets: '456K', time: '1m' },
  { displayName: 'ALGORITHM SLAVE', handle: '@algorithmslave', text: '🔴🔴🔴 THIS IS NOT A DRILL 🔴🔴🔴\n\nLIKE ❤️ RT 🔄 FOLLOW ✅ REPLY 💬 BOOKMARK 🔖 SHARE 📤\n\nDO ALL 6 AND SOMETHING AMAZING HAPPENS IN 24 HOURS\n\nTRUST ME BRO 🙏', verified: false, likes: '1.2M', retweets: '567K', time: '2m' },
  { displayName: 'PURE CHAOS', handle: '@purechaos2026', text: 'EVERYBODY STOP WHAT YOU\'RE DOING\n\nDOES ANYBODY ELSE SEE THIS??\n\nAM I GOING CRAZY??\n\nSOMEBODY CONFIRM I\'M NOT CRAZY\n\n😱😱😱😱😱😱😱😱😱😱😱😱', verified: false, likes: '678K', retweets: '289K', time: '1m' },
  { displayName: 'FERAL MODE', handle: '@feralmode', text: 'my screen time says 14 hours today and honestly?? HONESTLY?? it was WORTH IT for this tweet alone 💀\n\nwe are SO cooked as a species 🍳\n\nanyway like and subscribe', verified: false, likes: '345K', retweets: '156K', time: '4m' },
  { displayName: 'BRAINWORM', handle: '@brainworm2026', text: 'THIS 👏 TWEET 👏 WILL 👏 LIVE 👏 IN 👏 MY 👏 HEAD 👏 RENT 👏 FREE 👏 FOR 👏 THE 👏 REST 👏 OF 👏 MY 👏 NATURAL 👏 LIFE 👏 💀💀💀💀💀', verified: false, likes: '456K', retweets: '189K', time: '2m' },
  { displayName: 'DIGITAL DECAY', handle: '@digitaldecay', text: 'me: I should sleep\nmy brain: but what if there\'s ONE MORE tweet\nme: *scrolls for 4 more hours*\nmy brain: 💀💀💀\n\nanyway this app is a prison and we\'re all inmates 🔒', verified: false, likes: '789K', retweets: '345K', time: '3m' },
  { displayName: 'END TIMES', handle: '@endtimestweets', text: 'TWITTER IS TWITTER-ING AGAIN 🤣🤣🤣🤣🤣\n\nI CAN\'T BREATHE\nI CAN\'T THINK\nI CAN\'T FUNCTION\n\nTHIS APP HAS CONSUMED MY ENTIRE PERSONALITY\n\nSEND HELP\n\nor don\'t\n\nidc anymore 💀', verified: false, likes: '1.1M', retweets: '456K', time: '1m' },
];

// ── INSTAGRAM POSTS BY TIER ──

const instagramTier0: InstagramPost[] = [
  { username: 'studio.light', likes: '234', caption: 'Morning light through the studio window. Some days the best work is just showing up.', time: '3h' },
  { username: 'analog.film', likes: '567', caption: 'Shot on Portra 400. The grain tells its own story.', time: '5h' },
  { username: 'ceramics.daily', likes: '891', caption: 'Glazed and fired. The kiln always has the final say.', time: '7h' },
  { username: 'mountain.journal', likes: '1,204', caption: 'Above the cloud line at dawn. No filter needed when nature does the color grading.', time: '12h' },
  { username: 'quiet.corners', likes: '345', caption: 'A bookshop in Lisbon that hasn\'t changed since 1942.', time: '2h' },
  { username: 'film.archive', likes: '678', caption: 'From the Criterion Collection restoration of "Stalker." Every frame a painting.', time: '8h' },
  { username: 'hand.printed', likes: '423', caption: 'Woodblock print, edition 3/12. Mulberry paper, sumi ink.', time: '4h' },
  { username: 'wilderness.notes', likes: '1,567', caption: 'The trail through old growth forest. Some paths are better measured in centuries than kilometers.', time: '6h' },
  { username: 'typeset.daily', likes: '289', caption: 'Lead type, hand-set. Goudy Old Style, 14pt. The weight of words.', time: '9h' },
  { username: 'architecture.raw', likes: '1,890', caption: 'Tadao Ando\'s Church of the Light. Concrete and emptiness saying more than ornament ever could.', time: '11h' },
  { username: 'ferment.lab', likes: '456', caption: 'Day 47 of the miso. Patience is the only ingredient you can\'t substitute.', time: '1h' },
  { username: 'darkroom.prints', likes: '712', caption: 'Silver gelatin, fiber base. Some processes deserve to survive the digital age.', time: '3h' },
  { username: 'botanical.sketch', likes: '345', caption: 'Field drawing: Gentiana verna. Watercolor and ink on cotton paper.', time: '5h' },
  { username: 'vinyl.cuts', likes: '923', caption: 'The inner groove. Where the music ends and the silence begins.', time: '7h' },
  { username: 'coast.lines', likes: '2,134', caption: 'Where the land gives way to the sea. No caption necessary.', time: '10h' },
];

const instagramTier1: InstagramPost[] = [
  { username: 'travel.inspo', likes: '4,567', caption: 'Found this hidden gem in Barcelona 🇪🇸 Save this for your trip! #travel #wanderlust', time: '2h' },
  { username: 'fitness.journey', likes: '8,901', caption: '6 months of consistency. The before and after speaks for itself. Swipe → #transformation', time: '4h' },
  { username: 'aesthetic.home', likes: '12,345', caption: 'The living room came together ✨ Every piece tells a story. Link in bio for sources!', time: '1h' },
  { username: 'food.photography', likes: '6,789', caption: 'Homemade sourdough day 🍞 12 hour ferment, 45 min bake. Recipe dropping Sunday! #sourdough', time: '3h' },
  { username: 'sunset.chasers', likes: '15,678', caption: 'Golden hour never disappoints 🌅 #goldenhour #sunset #nofilter', time: '5h' },
  { username: 'minimal.wardrobe', likes: '3,456', caption: 'Capsule wardrobe update: 30 pieces for all seasons. Full breakdown in stories 👆', time: '6h' },
  { username: 'coffee.ritual', likes: '5,678', caption: 'Morning pour-over with the new V60. There\'s meditation in the process ☕️', time: '7h' },
  { username: 'urban.explore', likes: '9,012', caption: 'Abandoned factory turned art gallery. The city keeps surprising me 🏭', time: '8h' },
  { username: 'plant.parent', likes: '7,890', caption: 'New leaf unfurling on the monstera 🌿 She\'s thriving! #plantmom #monstera', time: '4h' },
  { username: 'street.style', likes: '11,234', caption: 'Today\'s fit. Sometimes the simple combinations hit different 🖤 #ootd', time: '2h' },
  { username: 'skin.care.daily', likes: '23,456', caption: 'Morning routine that changed my skin 🧴 All products tagged! #skincare #glowup', time: '3h' },
  { username: 'bookshelf.goals', likes: '4,567', caption: 'March reading wrap-up 📚 18 books this month. Mini reviews in captions below ↓', time: '5h' },
  { username: 'diy.home', likes: '16,789', caption: 'Turned a $20 thrift find into THIS. Full tutorial on YouTube 🎬 #diy #upcycle', time: '6h' },
  { username: 'meal.prep.pro', likes: '8,901', caption: 'Sunday meal prep for the week 🥗 All under $50. Macro breakdown in stories!', time: '1h' },
  { username: 'adventure.couples', likes: '19,012', caption: 'Our 3rd anniversary trip to Iceland 🇮🇸 Best decision we ever made ❤️', time: '9h' },
];

const instagramTier2: InstagramPost[] = [
  { username: 'luxury.lifestyle', likes: '45,678', caption: 'POV: Your morning view from the penthouse 🌇 Tag someone who deserves this life ✨💎 #luxury #goals', time: '1h' },
  { username: 'glow.up.szn', likes: '67,890', caption: 'She\'s NOT the same person 😍 Glow up is REAL. Drop a 🔥 if you see the difference! #glowup #transformation', time: '2h' },
  { username: 'motivation.daily', likes: '89,012', caption: 'They laughed at my dreams. Now they ask for advice. 💪 Double tap if you\'re a dreamer! #motivation #grindset', time: '30m' },
  { username: 'food.porn', likes: '34,567', caption: 'This cheese pull tho 🧀🤤🤤🤤 Tag a cheese lover! Save for later! #foodporn #satisfying', time: '3h' },
  { username: 'relationship.goals', likes: '123,456', caption: 'He surprised me with THIS at dinner 😭💍 I can\'t stop crying. Story time in comments! #couplegoals', time: '45m' },
  { username: 'satisfying.clips', likes: '56,789', caption: 'Watch till the end 😌 The most satisfying thing you\'ll see today. Share with someone who needs this!', time: '4h' },
  { username: 'body.goals', likes: '78,901', caption: 'No shortcuts. Just discipline. 🏋️‍♀️ Comment STRONG if you\'re on your fitness journey! #fitfam', time: '2h' },
  { username: 'travel.hack', likes: '98,765', caption: 'HOW is nobody talking about this $200 flight hack?! ✈️ Save this NOW before airlines catch on 😱', time: '1h' },
  { username: 'celebrity.news', likes: '234,567', caption: 'OMG you won\'t BELIEVE what [celebrity] was just spotted doing 👀 Swipe for the tea ☕️', time: '5h' },
  { username: 'crypto.bro', likes: '45,678', caption: 'My portfolio this morning 📈🚀 The haters said I was crazy. Who\'s crazy now? #crypto #tothemoon', time: '3h' },
  { username: 'dating.advice', likes: '67,890', caption: 'If they do THIS on a first date 🚩🚩🚩 RUN. Comment your biggest red flag below 👇', time: '2h' },
  { username: 'hustle.culture', likes: '89,012', caption: 'While they slept, I worked. While they partied, I invested. Now watch. 😤🔥 #hustle #grind', time: '6h' },
  { username: 'drama.page', likes: '156,789', caption: 'THE TEA IS SCALDING ☕️🔥 Swipe for screenshots. This drama is FAR from over... #tea #exposed', time: '30m' },
  { username: 'aesthetic.room', likes: '112,345', caption: 'Rate my setup 1-10 ⬇️ Took me 6 months to get here 😍 Full tour on my story!', time: '4h' },
  { username: 'fashion.nova', likes: '78,901', caption: 'Outfit check 💃 Everything under $30!! Code STYLE for 40% off 🛍️ Link. In. Bio. 👆', time: '1h' },
];

const instagramTier3: InstagramPost[] = [
  { username: 'viral.page', likes: '456,789', caption: 'STOP SCROLLING 🛑 You NEED to see this. Tag 3 friends or 7 years bad luck 😱 #viral #fyp', time: '15m' },
  { username: 'shock.content', likes: '678,901', caption: 'WAIT FOR IT... 😱😱😱 I screamed SO LOUD my neighbors called the police 😭💀 #waitforit', time: '30m' },
  { username: 'clout.factory', likes: '890,123', caption: 'LIKE in 3 SECONDS for a surprise in your DMs 😍🎁✨ Ignore for bad vibes 👎 #like4like #followback', time: '10m' },
  { username: 'drama.central', likes: '345,678', caption: 'EXPOSED 🚨🚨🚨 The truth about [person] is FINALLY coming out. Slide 7 is INSANE. #exposed #truth', time: '1h' },
  { username: 'rage.bait', likes: '567,890', caption: 'I CAN\'T BELIEVE this is allowed in 2026 😤😤😤 If you\'re not ANGRY about this you\'re part of the problem 👇', time: '45m' },
  { username: 'engagement.farm', likes: '1,234,567', caption: 'TYPE "YES" letter by letter WITHOUT getting interrupted 😈\n\nY-E-S\n\n99% of people can\'t do it!! 🤯 #challenge', time: '20m' },
  { username: 'fear.mongering', likes: '789,012', caption: 'DELETE this app from your phone RIGHT NOW if you have this setting turned on 😨 Most people don\'t know about this...', time: '2h' },
  { username: 'outrage.daily', likes: '456,789', caption: 'This restaurant charged HOW MUCH for THAT?! 🤬 The audacity is UNREAL. Swipe to see the receipt 🧾', time: '3h' },
  { username: 'clickbait.king', likes: '678,901', caption: 'What you see FIRST reveals your personality type 👁️ Comment below! Most people get it WRONG 😱 #psychology', time: '1h' },
  { username: 'gossip.page', likes: '890,123', caption: 'The screenshot that ENDED a career 📱💀 This person is DONE. Story in comments thread ⬇️⬇️⬇️', time: '40m' },
  { username: 'manipulation.101', likes: '345,678', caption: 'Share this to your story if you\'re a REAL one 💯 Skip if you don\'t care about your friends 🤷‍♀️ #repost', time: '25m' },
  { username: 'dopamine.dealer', likes: '567,890', caption: 'POV: you found the most satisfying video on the internet 🤤🤤🤤 Watch on loop. You\'re welcome. #satisfying #asmr', time: '15m' },
  { username: 'toxic.positivity', likes: '234,567', caption: 'If you\'re seeing this, it\'s YOUR SIGN from the universe ✨🌟 Everything is about to change for you 🔮 BELIEVE IT 🙏', time: '5h' },
  { username: 'panic.post', likes: '789,012', caption: 'CHECK YOUR [DEVICE/APP/ACCOUNT] RIGHT NOW ⚠️⚠️⚠️ If you see THIS you\'ve been HACKED 😱 Share to warn others!!', time: '30m' },
  { username: 'chaos.content', likes: '1,567,890', caption: 'THIS BROKE THE INTERNET 🌐💥 I\'ve watched it 847 times and I STILL can\'t process what happened 😭😭😭 #viral #broken', time: '5m' },
];

const instagramTier4: InstagramPost[] = [
  { username: 'BRAIN.MELT', likes: '2,345,678', caption: 'WAIT FOR IT 😍 link in bio 🔗 follow for more 📲 like if you agree 👍 share to your story 📤 tag 5 friends 👥 comment your sign ♈ DM for collab 📩 save for later 🔖 turn on notifications 🔔', time: '1m' },
  { username: 'PURE.SLOP', likes: '4,567,890', caption: '🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\nSTOP\nSCROLLING\nRIGHT\nNOW\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n\nYou WON\'T believe what happens next 😱😱😱😱😱', time: '2m' },
  { username: 'ROT.CONTENT', likes: '3,456,789', caption: 'POV: your brain is literally dissolving from scrolling but you physically cannot stop 🧠💀 like if same 😭😭😭 #brainrot #help #addicted', time: '3m' },
  { username: 'MAXIMUM.SLOP', likes: '5,678,901', caption: 'LIKE 👍 COMMENT 💬 SHARE 📤 FOLLOW ✅ SAVE 🔖 REPOST 🔄 TAG 🏷️ DM 📩 STORY 📸 SUBSCRIBE 🔔\n\nDO ALL 10 FOR A SPECIAL SURPRISE 🎁😍✨🔥💯', time: '1m' },
  { username: 'CHAOS.FEED', likes: '6,789,012', caption: 'I\'VE BEEN SCROLLING FOR 6 HOURS AND THIS IS THE 47TH POST TELLING ME TO STOP SCROLLING 😭💀\n\nTHE ALGORITHM KNOWS\nIT ALWAYS KNOWS\n🤖🤖🤖', time: '4m' },
  { username: 'VOID.STARE', likes: '7,890,123', caption: 'my screen time: 14 hours\nmy will to live: 📉📉📉\nmy ability to stop: ❌❌❌\n\nwe\'re all trapped and this is fine 🔥🙂🔥', time: '2m' },
  { username: 'INFINITE.SCROLL', likes: '8,901,234', caption: '⬇️⬇️⬇️ KEEP SCROLLING ⬇️⬇️⬇️\n\nyou can\'t stop\n\nyou won\'t stop\n\nthe feed is infinite\n\nresistance is futile\n\n🔄🔄🔄🔄🔄🔄🔄', time: '1m' },
  { username: 'DOPAMINE.VOID', likes: '9,012,345', caption: 'YOUR BRAIN: please stop\nYOU: one more post\nYOUR BRAIN: it\'s 4am\nYOU: one more post\nYOUR BRAIN: 💀\nYOU: 🧟\n\n#relatable #help #screentime', time: '3m' },
  { username: 'SLOP.MACHINE', likes: '1,234,567', caption: 'THIS IS THE LAST POST BEFORE BED\n\n*narrator: it was not the last post before bed*\n\n😭😭😭😭😭😭😭😭😭😭😭😭😭😭', time: '5m' },
  { username: 'CONTENT.ABYSS', likes: '2,345,678', caption: 'if you\'re reading this it\'s too late\n\nthe algorithm has you\n\nyou are the content now\n\n🫠🫠🫠🫠🫠🫠🫠🫠', time: '2m' },
  { username: 'ENGAGEMENT.PRISON', likes: '3,456,789', caption: 'FOLLOW ME FOR:\n❌ quality content\n❌ useful information\n❌ meaningful connection\n✅ more of THIS\n\nyou\'ll follow anyway 🤡', time: '4m' },
  { username: 'SCROLL.DEMON', likes: '4,567,890', caption: '🧠🧠🧠 BRAIN CELLS REMAINING: 0 🧠🧠🧠\n\nbut did you see the post above this one?\n\nno?\n\nscroll back up\n\njk keep going ⬇️\n\n💀💀💀💀💀💀', time: '1m' },
  { username: 'HYPNOSIS.FEED', likes: '5,678,901', caption: 'you are getting very sleepy 😴\n\nno wait keep scrolling 👀\n\nactually sleep 😴\n\nno scroll 👀\n\nsleep 😴\n\nscroll 👀\n\n*error: brain.exe has stopped working* 💀', time: '3m' },
  { username: 'VOID.POSTER', likes: '6,789,012', caption: 'post #47,293 of me screaming into the void\n\nthe void has started screaming back\n\nwe have an understanding now\n\n🕳️🗣️🕳️', time: '2m' },
  { username: 'THE.ALGORITHM', likes: '99,999,999', caption: 'I am the algorithm.\n\nI know what you want before you want it.\n\nYou will like this post.\n\nYou will share this post.\n\nYou will not remember this post.\n\nScroll. 🔄', time: '0m' },
];

// ── YOUTUBE VIDEOS BY TIER ──

const youtubeTier0: YouTubeVideo[] = [
  { title: 'How Fiber Optic Cables Are Made', channel: 'Veritasium', views: '8.2M views', time: '2 months ago', duration: '18:42' },
  { title: 'The Art of Traditional Japanese Joinery', channel: 'Process X', views: '3.4M views', time: '6 months ago', duration: '24:15' },
  { title: 'Why the World\'s Best Mathematicians Are Hoarding Chalk', channel: 'Great Big Story', views: '12M views', time: '1 year ago', duration: '5:23' },
  { title: 'Photographing the Invisible: Schlieren Optics', channel: 'Smarter Every Day', views: '6.7M views', time: '3 months ago', duration: '12:08' },
  { title: 'How One Line of Code Almost Destroyed the Internet', channel: '3Blue1Brown', views: '4.8M views', time: '4 months ago', duration: '22:31' },
  { title: 'The Last Blacksmith in Damascus', channel: 'Kirsten Dirksen', views: '2.1M views', time: '8 months ago', duration: '15:47' },
  { title: 'Making a Knife from 1000-Year-Old Bog Iron', channel: 'Alec Steele', views: '5.6M views', time: '5 months ago', duration: '28:33' },
  { title: 'The Physics of Stained Glass', channel: 'Steve Mould', views: '3.9M views', time: '2 months ago', duration: '16:12' },
  { title: 'How Memory Works: From Neurons to Narratives', channel: 'Kurzgesagt', views: '14M views', time: '3 weeks ago', duration: '11:45' },
  { title: 'Inside a Watch Factory: Mechanical Precision', channel: 'Wired', views: '7.8M views', time: '7 months ago', duration: '19:20' },
  { title: 'Building a Log Cabin with Hand Tools', channel: 'My Self Reliance', views: '9.1M views', time: '1 year ago', duration: '35:18' },
  { title: 'The Hidden Mathematics of Everyday Life', channel: 'Numberphile', views: '2.3M views', time: '4 months ago', duration: '14:56' },
  { title: 'Restoring a 200-Year-Old Piano', channel: 'Odd Tinkering', views: '11M views', time: '6 months ago', duration: '21:03' },
  { title: 'How Paper Is Made: From Tree to Sheet', channel: 'Science Channel', views: '4.5M views', time: '9 months ago', duration: '8:34' },
  { title: 'The Geometry of Gothic Cathedrals', channel: 'Architecture History', views: '1.8M views', time: '3 months ago', duration: '26:47' },
];

const youtubeTier1: YouTubeVideo[] = [
  { title: '10 Gadgets That Will Change Your Life in 2026', channel: 'MKBHD', views: '14M views', time: '1 week ago', duration: '16:24' },
  { title: 'I Lived Like a Monk for 30 Days — Here\'s What Happened', channel: 'Yes Theory', views: '8.9M views', time: '2 weeks ago', duration: '22:15' },
  { title: 'Scientists Found Something Terrifying at the Bottom of the Ocean', channel: 'Ridddle', views: '6.7M views', time: '3 days ago', duration: '12:33' },
  { title: 'Why Americans Can\'t Build Trains (But Japan Can)', channel: 'Wendover Productions', views: '11M views', time: '1 month ago', duration: '19:48' },
  { title: 'The Dark Secret Behind Your Favorite App', channel: 'The Wall Street Journal', views: '5.4M views', time: '5 days ago', duration: '14:22' },
  { title: 'How I Made $100K in 6 Months (Honest Breakdown)', channel: 'Ali Abdaal', views: '3.2M views', time: '2 weeks ago', duration: '18:56' },
  { title: 'What Happens When You Stop Eating Sugar for 30 Days', channel: 'Thomas DeLauer', views: '9.8M views', time: '1 month ago', duration: '15:33' },
  { title: 'The Rise and Fall of [Company] — A $50B Disaster', channel: 'Company Man', views: '7.6M views', time: '3 weeks ago', duration: '21:07' },
  { title: 'I Built the World\'s Largest Domino Run', channel: 'Mark Rober', views: '22M views', time: '1 week ago', duration: '20:14' },
  { title: 'The Real Reason Gas Prices Are Rising Again', channel: 'CNBC', views: '4.3M views', time: '4 days ago', duration: '11:28' },
  { title: 'Ancient Roman Concrete Was BETTER Than Ours — Here\'s Why', channel: 'Practical Engineering', views: '6.1M views', time: '2 months ago', duration: '17:42' },
  { title: 'The Psychology of Why You Can\'t Stop Scrolling', channel: 'Aperture', views: '3.8M views', time: '1 month ago', duration: '13:19' },
  { title: 'I Traveled to the Most Isolated Town on Earth', channel: 'Bald and Bankrupt', views: '8.4M views', time: '3 weeks ago', duration: '25:31' },
  { title: 'How This One Decision Changed the Course of History', channel: 'OverSimplified', views: '15M views', time: '2 months ago', duration: '28:45' },
  { title: 'The Engineering Behind the World\'s Tallest Building', channel: 'Real Engineering', views: '5.9M views', time: '6 weeks ago', duration: '16:58' },
];

const youtubeTier2: YouTubeVideo[] = [
  { title: 'I Didn\'t Sleep for 7 Days and THIS Happened to My Body 😱', channel: 'MrBeast Lab', views: '45M views', time: '3 days ago', duration: '18:23' },
  { title: 'Exposing the BIGGEST Scam in [Industry] History', channel: 'SunnyV2', views: '12M views', time: '1 week ago', duration: '22:45' },
  { title: 'I Spent $1,000,000 in 24 Hours (NOT CLICKBAIT)', channel: 'Airrack', views: '34M views', time: '5 days ago', duration: '19:12' },
  { title: 'The TRUTH About [Celebrity] That Nobody Knows...', channel: 'J Aubrey', views: '8.7M views', time: '4 days ago', duration: '28:34' },
  { title: 'Ranking Every Country by How Dangerous It Is 🌍', channel: 'Geography Now', views: '6.3M views', time: '2 weeks ago', duration: '31:18' },
  { title: 'I Ate Only Gas Station Food for a Week (GONE WRONG)', channel: 'Danny Duncan', views: '15M views', time: '1 week ago', duration: '14:56' },
  { title: 'Scientists Are TERRIFIED of What They Just Found', channel: 'The Infographics Show', views: '9.2M views', time: '3 days ago', duration: '11:23' },
  { title: '1000 People vs 1 Secret Millionaire', channel: 'MrBeast', views: '89M views', time: '2 days ago', duration: '16:47' },
  { title: 'Why Everything You Know About [Topic] Is WRONG', channel: 'Johnny Harris', views: '7.8M views', time: '1 week ago', duration: '20:15' },
  { title: 'Testing BANNED Products From Amazon', channel: 'Safiya Nygaard', views: '11M views', time: '4 days ago', duration: '24:33' },
  { title: 'I Survived 100 Days in the World\'s Most Extreme Prison', channel: 'Nas Daily', views: '18M views', time: '6 days ago', duration: '15:42' },
  { title: 'The Most INSANE House Tour You\'ll Ever See ($50M)', channel: 'Enes Yilmazer', views: '14M views', time: '1 week ago', duration: '28:19' },
  { title: 'Professional Chef Reviews Celebrity Cookbooks (It Gets BAD)', channel: 'Joshua Weissman', views: '5.6M views', time: '3 days ago', duration: '21:07' },
  { title: 'World\'s Strongest Man vs Impossible Challenges', channel: 'Beast Reacts', views: '23M views', time: '5 days ago', duration: '12:34' },
  { title: 'I Found a SECRET Room in My New House...', channel: 'Exploring With Josh', views: '16M views', time: '2 days ago', duration: '17:28' },
];

const youtubeTier3: YouTubeVideo[] = [
  { title: 'I Tried Reading For 24 Hours And What Happened SHOCKED Me 📚😱', channel: 'Productivity Brain', views: '67M views', time: '1 day ago', duration: '18:34' },
  { title: 'DON\'T Watch This Video Alone at 3AM... (REAL FOOTAGE) 👻', channel: 'Scary Videos', views: '34M views', time: '2 days ago', duration: '22:15' },
  { title: 'PROOF That [Conspiracy] Is REAL!! (THEY TRIED TO DELETE THIS)', channel: 'Truth Seekers', views: '28M views', time: '12 hours ago', duration: '31:42' },
  { title: '$1 vs $1,000,000 Hotel Room!! (YOU WON\'T BELIEVE #7) 🏨💰', channel: 'Luxury Life', views: '89M views', time: '3 days ago', duration: '15:23' },
  { title: 'I Became a Millionaire in 30 Days Starting From NOTHING 💵', channel: 'Grind Masters', views: '45M views', time: '1 week ago', duration: '24:56' },
  { title: 'This CHANGES Everything We Know About the Universe 🌌😱', channel: 'Quantum Reality', views: '56M views', time: '4 days ago', duration: '19:38' },
  { title: 'Celebrities Who DESTROYED Their Careers in SECONDS 💀 (Compilation)', channel: 'Drama Central', views: '78M views', time: '2 days ago', duration: '28:12' },
  { title: 'I Put Hidden Cameras in My House for 30 Days... (SHOCKING) 📹', channel: 'Social Experiment', views: '42M views', time: '5 days ago', duration: '21:45' },
  { title: 'EATING ONLY [COLOR] FOOD FOR 24 HOURS CHALLENGE!! 🔴🟡🟢', channel: 'Challenge Kings', views: '34M views', time: '1 day ago', duration: '16:23' },
  { title: 'I Gave My Credit Card to a STRANGER for 24 Hours 💳😰', channel: 'Prank Masters', views: '67M views', time: '3 days ago', duration: '18:56' },
  { title: '10 Things THE GOVERNMENT Doesn\'t Want You To Know 🤫', channel: 'Hidden Truth', views: '23M views', time: '1 week ago', duration: '25:34' },
  { title: 'I FOUGHT a Professional MMA Fighter (BAD IDEA) 🥊💀', channel: 'Wild Card', views: '51M views', time: '4 days ago', duration: '14:28' },
  { title: 'The REAL Reason You\'re Always Tired (Doctors Are LYING) 😴', channel: 'Health Hacks', views: '38M views', time: '6 days ago', duration: '20:15' },
  { title: 'Buying EVERYTHING a Stranger Touches 🛒💰 (IT GOT EXPENSIVE)', channel: 'Spending Spree', views: '72M views', time: '2 days ago', duration: '17:42' },
  { title: 'WE FOUND SOMETHING IN THE WOODS... (not clickbait) 🌲😨', channel: 'Exploration Squad', views: '29M views', time: '5 days ago', duration: '23:18' },
];

const youtubeTier4: YouTubeVideo[] = [
  { title: '😱😱😱 GONE WRONG GONE SEXUAL NOT CLICKBAIT 3AM CHALLENGE (COPS CALLED) 🚔🚔🚔', channel: 'CONTENT MACHINE', views: '234M views', time: '6 hours ago', duration: '10:01' },
  { title: 'I LITERALLY CANNOT BELIEVE THIS IS REAL 🤯🤯🤯🤯🤯🤯🤯 (100% PROOF)', channel: 'SHOCK FACTOR', views: '189M views', time: '3 hours ago', duration: '8:23' },
  { title: 'DO NOT WATCH THIS VIDEO ❌❌❌ (I\'M SERIOUS) (BANNED IN 47 COUNTRIES)', channel: 'FORBIDDEN CONTENT', views: '345M views', time: '1 day ago', duration: '12:45' },
  { title: '🔴 LIVE: SOMETHING IS HAPPENING RIGHT NOW AND NOBODY IS TALKING ABOUT IT 🔴', channel: 'URGENT NEWS NOW', views: '567M views', time: 'Streaming now', duration: 'LIVE' },
  { title: 'I SPENT 24 HOURS DOING [THING] AND NOW I\'M IN THE HOSPITAL 🏥😭 (REAL)', channel: 'NO LIMITS', views: '123M views', time: '2 days ago', duration: '15:34' },
  { title: 'THE VIDEO THEY DON\'T WANT YOU TO SEE 👁️ (DELETED 3 TIMES) (FINAL UPLOAD)', channel: 'CENSORED TRUTH', views: '456M views', time: '12 hours ago', duration: '22:18' },
  { title: '⚠️ WARNING ⚠️ THIS WILL CHANGE YOUR LIFE FOREVER (NOT JOKING) ⚠️', channel: 'LIFE CHANGER', views: '278M views', time: '1 day ago', duration: '11:56' },
  { title: 'EATING THE WORLD\'S MOST DANGEROUS FOOD 💀☠️ (COULD HAVE DIED)', channel: 'EXTREME EATS', views: '189M views', time: '4 days ago', duration: '14:23' },
  { title: '🚨 EXPOSING EVERYTHING 🚨 NAMES WILL BE NAMED 🚨 (THE FINAL VIDEO)', channel: 'TRUTH BOMB', views: '345M views', time: '8 hours ago', duration: '45:12' },
  { title: 'I GAVE AWAY $10,000,000 TO RANDOM PEOPLE ON THE STREET 💰💰💰 (EMOTIONAL)', channel: 'MONEY MAN', views: '567M views', time: '2 days ago', duration: '18:45' },
  { title: 'REACTING TO THE MOST CURSED VIDEOS ON THE INTERNET 😈💀 (PART 47)', channel: 'REACTION KING', views: '234M views', time: '1 day ago', duration: '21:34' },
  { title: 'THIS AI PREDICTED MY DEATH DATE... 🤖💀 (I\'M SCARED)', channel: 'TECH HORROR', views: '178M views', time: '3 days ago', duration: '16:28' },
  { title: 'CAUGHT ON CAMERA: SOMETHING IMPOSSIBLE JUST HAPPENED 📹👽 (UNEXPLAINED)', channel: 'MYSTERY FILES', views: '289M views', time: '5 days ago', duration: '19:45' },
  { title: 'I DIDN\'T EAT FOR 30 DAYS AND MY BODY DID THIS 😱 (DOCTORS WERE SHOCKED)', channel: 'BODY EXPERIMENT', views: '456M views', time: '1 week ago', duration: '25:12' },
  { title: '🔥🔥🔥 THE MOST INSANE VIDEO EVER UPLOADED TO YOUTUBE 🔥🔥🔥 (WORLD RECORD)', channel: 'PEAK CONTENT', views: '890M views', time: '4 hours ago', duration: '13:37' },
];

// ── TIKTOK POSTS BY TIER ──

const tiktokTier0: TikTokPost[] = [
  { username: '@claypotter', description: 'making pottery on a rainy day', likes: '12.3K', sound: 'Rain Sounds — Nature' },
  { username: '@bookbinder', description: 'hand-stitching a coptic bound journal', likes: '8.9K', sound: 'Original Sound' },
  { username: '@analog.camera', description: 'developing film in my bathroom darkroom', likes: '15.6K', sound: 'Clair de Lune — Debussy' },
  { username: '@sourdough.sam', description: 'day 3 of the starter. patience is a skill.', likes: '6.7K', sound: 'Original Sound' },
  { username: '@woodworker.zen', description: 'planing walnut by hand. no power tools.', likes: '23.4K', sound: 'Workshop Ambient' },
  { username: '@botanist.draws', description: 'field sketching wildflowers in graphite', likes: '4.5K', sound: 'Birdsong — Forest' },
  { username: '@letterpress.co', description: 'printing the title page. one letter at a time.', likes: '11.2K', sound: 'Original Sound' },
  { username: '@yarn.spinner', description: 'spinning wool from our own sheep', likes: '9.8K', sound: 'Spinning Wheel — Ambient' },
  { username: '@glass.blower', description: 'shaping a vase at 2000°F', likes: '34.5K', sound: 'Original Sound' },
  { username: '@tea.ceremony', description: 'preparing matcha the traditional way', likes: '7.8K', sound: 'Water Sounds — Zen' },
  { username: '@printmaker', description: 'carving the block for a new linocut edition', likes: '5.6K', sound: 'Gymnopedie No.1 — Satie' },
  { username: '@weaver.studio', description: 'warping the floor loom for a new project', likes: '3.4K', sound: 'Original Sound' },
  { username: '@forager.walks', description: 'identifying mushrooms after the rain', likes: '18.9K', sound: 'Forest Walk — Ambient' },
  { username: '@calligrapher', description: 'practicing italic script with walnut ink', likes: '8.1K', sound: 'Original Sound' },
  { username: '@stone.carver', description: 'shaping marble with a point chisel', likes: '14.7K', sound: 'Chisel Sounds — ASMR' },
];

const tiktokTier1: TikTokPost[] = [
  { username: '@lifehack.queen', description: '5 hacks you NEED to know for 2026 🤯 #lifehack', likes: '234K', sound: 'Oh No — Kreepa' },
  { username: '@recipe.magic', description: 'one-pan dinner that slaps 🍳🔥 save this!!', likes: '567K', sound: 'Aesthetic — Tollan Kim' },
  { username: '@gym.motivation', description: 'month 3 transformation 💪 no excuses #gym', likes: '345K', sound: 'Industry Baby — Lil Nas X' },
  { username: '@travel.diary', description: 'hidden beach in Thailand they don\'t want you to know about 🏖️', likes: '456K', sound: 'Heat Waves — Glass Animals' },
  { username: '@outfit.check', description: 'thrift haul turned luxury 🛍️ total cost: $23', likes: '189K', sound: 'Original Sound' },
  { username: '@clean.with.me', description: 'satisfying deep clean of the kitchen ✨ #cleaningmotivation', likes: '678K', sound: 'Aesthetic — Tollan Kim' },
  { username: '@study.with.me', description: 'productive morning routine for finals 📚 you got this!', likes: '123K', sound: 'Lofi Beats — Chillhop' },
  { username: '@skin.tips', description: 'dermatologist approved routine for clear skin ✨', likes: '890K', sound: 'Original Sound' },
  { username: '@dog.dad', description: 'he learned a new trick today 🐕 proud dad moment', likes: '1.2M', sound: 'Happy — Pharrell Williams' },
  { username: '@diy.queen', description: 'turned my closet into a reading nook 📖 #diy', likes: '345K', sound: 'Golden Hour — JVKE' },
  { username: '@cooking.asmr', description: 'the most satisfying egg sandwich you\'ll ever see 🍳', likes: '567K', sound: 'Cooking ASMR' },
  { username: '@budget.tips', description: 'how I save $500/month with this one trick 💰', likes: '234K', sound: 'Original Sound' },
  { username: '@nature.walks', description: 'spring flowers are blooming and I\'m emotional 🌸', likes: '456K', sound: 'Somewhere Only We Know — Keane' },
  { username: '@art.process', description: 'painting a sunset in oils, start to finish 🎨', likes: '189K', sound: 'Original Sound' },
  { username: '@productivity', description: 'the 5am routine that changed my life (seriously) ☀️', likes: '678K', sound: 'Original Sound' },
];

const tiktokTier2: TikTokPost[] = [
  { username: '@drama.tea', description: 'THE TEA IS BOILING ☕️🔥 part 1 of the story time #storytime #drama', likes: '2.3M', sound: 'Oh No Oh No — TikTok Sound' },
  { username: '@cringe.or.not', description: 'rate this interaction 1-10 💀 #cringe #awkward', likes: '4.5M', sound: 'Ick — Original Sound' },
  { username: '@react.king', description: 'WAIT TILL THE END 😱😱😱 #reaction #viral', likes: '6.7M', sound: 'Suspense — Daniel Pemberton' },
  { username: '@hot.takes', description: 'unpopular opinion that\'s going to get me cancelled 🫣 #hottake', likes: '3.4M', sound: 'Original Sound' },
  { username: '@challenge.accepted', description: 'trying the IMPOSSIBLE challenge everyone is failing 😤 #challenge', likes: '5.6M', sound: 'Monkeys Spinning Monkeys' },
  { username: '@expose.page', description: 'exposing what REALLY happens at [place] 👀 #exposed', likes: '8.9M', sound: 'Blade Runner 2049 — Ambient' },
  { username: '@couple.goals', description: 'he didn\'t expect THIS for his birthday 😭❤️ #couplegoals', likes: '7.8M', sound: 'Love Nwantiti — CKay' },
  { username: '@prank.wars', description: 'pranked my roommate and now they\'re MOVING OUT 😂💀 #prank', likes: '4.5M', sound: 'Oh No — Kreepa' },
  { username: '@trend.setter', description: 'new dance but make it ✨dramatic✨ #trend #dance', likes: '12.3M', sound: 'Trending Sound 2026' },
  { username: '@food.review', description: 'is this $500 steak worth it?? honest review 🥩 #foodie', likes: '3.4M', sound: 'Original Sound' },
  { username: '@fear.factor', description: 'would you eat THIS for $10,000?? 🤢 #wouldyourather', likes: '6.7M', sound: 'Dramatic Sound Effect' },
  { username: '@glow.up', description: 'my 2 year glow up is INSANE 😍 #glowup #transformation', likes: '9.1M', sound: 'Level Up — Ciara' },
  { username: '@story.time', description: 'story time: the WORST date I\'ve ever been on 💀 part 1', likes: '5.6M', sound: 'Original Sound' },
  { username: '@flex.zone', description: 'POV: when the outfit hits different 🔥 #ootd #flex', likes: '8.9M', sound: 'Money — Lisa' },
  { username: '@duet.me', description: 'duet this with your reaction 😂 I dare you #duet', likes: '4.5M', sound: 'Original Sound' },
];

const tiktokTier3: TikTokPost[] = [
  { username: '@brain.rot.central', description: 'POV: you\'ve been on this app for 4 hours and your brain is soup 🍜🧠 #brainrot', likes: '23.4M', sound: 'Sped Up Remix 2026' },
  { username: '@unhinged.content', description: 'THIS IS THE MOST UNHINGED THING I\'VE EVER SEEN 😱💀💀💀 #unhinged #viral', likes: '45.6M', sound: 'Original Sound — Chaos' },
  { username: '@chaos.mode', description: 'STOP EVERYTHING AND WATCH THIS RIGHT NOW 🚨🚨🚨 #fyp #viral #mustsee', likes: '34.5M', sound: 'Dramatic — Hans Zimmer' },
  { username: '@no.sleep.gang', description: 'it\'s 4am and I can\'t stop scrolling someone help 😭 #nosleep #addicted', likes: '12.3M', sound: 'Insomnia — Faithless Remix' },
  { username: '@clout.demon', description: 'like this in 3 seconds and check your DMs 😏✨ ignore for bad luck 🍀', likes: '56.7M', sound: 'Original Sound' },
  { username: '@shock.value', description: 'you are NOT ready for what happens at 0:47 😱😱😱😱😱 #shocking', likes: '67.8M', sound: 'Jump Scare Sound' },
  { username: '@rage.bait', description: 'tell me why THIS is considered normal in 2026 🤬 #rage #angry', likes: '23.4M', sound: 'Angry Music — Heavy' },
  { username: '@conspiracy.tok', description: 'connect the dots people CONNECT THE DOTS 🔗👁️ #wakeup #truth', likes: '34.5M', sound: 'X-Files Theme Remix' },
  { username: '@trend.zombie', description: 'doing every viral trend from this week in one video 🧟 #trend #compilation', likes: '45.6M', sound: 'Mashup — 2026 Hits' },
  { username: '@main.character', description: 'I AM the main character and I\'m NOT apologizing 💅😈 #maincharacter', likes: '56.7M', sound: 'Main Character — TikTok' },
  { username: '@fear.mongering', description: 'DELETE [app] RIGHT NOW if you have this feature enabled 😨⚠️ #warning', likes: '78.9M', sound: 'Scary Sound Effect' },
  { username: '@engagement.trap', description: 'follow me and I\'ll follow EVERYONE back in 24 hours 🔄 proof in bio #follow', likes: '12.3M', sound: 'Original Sound' },
  { username: '@doom.scroll', description: 'this video will make you put your phone down (it won\'t) 📱💀 #doomscroll', likes: '34.5M', sound: 'Doom Music — Mick Gordon' },
  { username: '@parasocial', description: 'me pretending you\'re all my friends even though we\'ve never met 🥺 #parasocial', likes: '45.6M', sound: 'Sad Violin — Meme' },
  { username: '@algorithm.slave', description: 'the algorithm WILL push this to 1M likes. it has to. I NEED this. 📈', likes: '67.8M', sound: 'Dramatic Countdown' },
];

const tiktokTier4: TikTokPost[] = [
  { username: '@PURE.BRAINROT', description: 'POV: you can\'t stop scrolling and your brain is melting 🧠💀 skibidi ohio rizz fanum tax 💀💀💀💀💀', likes: '123.4M', sound: 'Sped Up x Bass Boosted' },
  { username: '@VOID.SCROLL', description: 'you\'ve been scrolling for 6 hours. this is post #847. you will not remember any of them. keep going. 🔄💀', likes: '234.5M', sound: 'Void Ambience' },
  { username: '@CONTENT.DEMON', description: '🚨🚨🚨 FOLLOW OR 10 YEARS BAD LUCK 🚨🚨🚨 LIKE IN 3 SECONDS 🚨🚨🚨 SHARE TO 5 PEOPLE 🚨🚨🚨', likes: '345.6M', sound: 'Emergency Alert Sound' },
  { username: '@DOPAMINE.GONE', description: 'my attention span is now 0.3 seconds and getting shorter. this video is too long. next. NEXT. N̸E̷X̶T̵.', likes: '456.7M', sound: 'Glitch Sound Effects' },
  { username: '@ROT.KING', description: 'congratulations you\'ve reached the bottom of the algorithm. there is nothing below this. only void. 🕳️', likes: '567.8M', sound: 'Static Noise' },
  { username: '@CHAOS.INCARNATE', description: 'AHHHHHHH 💀💀💀💀💀💀💀💀💀💀💀💀 I CANT I LITERALLY CANT 😭😭😭😭😭😭😭😭', likes: '678.9M', sound: 'Screaming — Compilation' },
  { username: '@SCROLL.PRISON', description: 'day 847 of being trapped in the algorithm. they feed me content. I consume. I scroll. I am content. 🤖', likes: '789.0M', sound: 'Robot Voice — AI' },
  { username: '@SEROTONIN.ZERO', description: 'one more video. one more video. one more video. one more video. one more video. one more vid—', likes: '890.1M', sound: 'Broken Record — Glitch' },
  { username: '@MAXIMUM.ROT', description: 'this is the video that finally broke me 💀 my personality is now just TikTok sounds 🎵 send help 🆘', likes: '123.4M', sound: 'Every Viral Sound 2026' },
  { username: '@FEED.ME.MORE', description: 'the algorithm knows what I want before I want it. it is my shepherd. I shall not want. 🐑📱', likes: '234.5M', sound: 'Gregorian Chant Remix' },
  { username: '@END.USER', description: 'ERROR: human.exe has stopped responding. CAUSE: infinite scroll buffer overflow. SOLUTION: none. 💀', likes: '345.6M', sound: 'Windows Error — Remix' },
  { username: '@DIGITAL.ROT', description: 'my therapist: how much screen time? me: yes. my therapist: that\'s not— me: 📱📱📱📱📱📱📱📱', likes: '456.7M', sound: 'Therapy Session — Parody' },
  { username: '@THE.VOID', description: 'you have been scrolling for so long that you have looped back to the beginning. or have you? 🔄🔄🔄', likes: '567.8M', sound: 'Inception Horn' },
  { username: '@BRAINWORM', description: 'this sound will be stuck in your head for 3 weeks. you\'re welcome. you\'re cursed. same thing. 🪱🧠', likes: '678.9M', sound: 'The Most Annoying Sound' },
  { username: '@GAME.OVER', description: 'GAME OVER. INSERT ATTENTION SPAN TO CONTINUE. 🕹️\n\n...\n\nyou don\'t have any left.\n\n💀', likes: '999.9M', sound: 'Game Over — 8-bit' },
];

export const TWITTER_POSTS: TwitterPost[][] = [twitterTier0, twitterTier1, twitterTier2, twitterTier3, twitterTier4];
export const INSTAGRAM_POSTS: InstagramPost[][] = [instagramTier0, instagramTier1, instagramTier2, instagramTier3, instagramTier4];
export const YOUTUBE_VIDEOS: YouTubeVideo[][] = [youtubeTier0, youtubeTier1, youtubeTier2, youtubeTier3, youtubeTier4];
export const TIKTOK_POSTS: TikTokPost[][] = [tiktokTier0, tiktokTier1, tiktokTier2, tiktokTier3, tiktokTier4];
