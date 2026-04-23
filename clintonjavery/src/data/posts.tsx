export type Post = {
  slug: string;
  title: string;
  date: string;
  preview: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: "TwoPowershellCommandsofDomainTransfer",
    title: "Two Powershell Commands of Domain Transfer",
    date: "April 23, 2026",
    preview: "Moving a domain from Azure to Cloudflare?  This might come in handy",
    content : `So this might be an embarrassing admission but I’ve only recently (within the last year or so) become aware of how good Cloudflare is as a cloud hosting provider.  Especially for folks like me who like creating small scale fun projects and just want to get things up and running.  Part of the blame isn’t on me, professionally my focus has been on cloud development within an enterprise setting, and that has meant Azure and AWS of course, so that’s what I’ve focused on learning.
	But Cloudflare!  Man great setup, I almost don’t want to tell you about it because it’s so good I want it all to myself.  I’ve put a couple projects up there, if you’re curious you can check out the projects section of this site and you’ll see a couple of them.  It makes it so easy to get something up and running.  Even with a custom domain and https support.  And that’s the thing that I wanted to talk about, because on Azure, you can do that stuff, of course you can do pretty much anything on Azure but man it’s way harder, and recently I got hit with a forced upgrade to Azure Front Door when their CDN got deprecated and so I went from paying less than $2 a month for my website to nearly $50.  It was a bit insane.  
	When I saw that I realized I have to move and find an alternative hosting solution.  And cloudflare, while it doesn’t give you free domains of course, it does set you up with a decent free tier for hosting (and even for some backend stuff).
	But I wanted to talk specifically about moving domains out of Azure into Cloudflare.  Maybe this will be useful to you.  I’ve always kind of wondered how this works, because you think, wow what if I bought some url like amazinglysellableurl.com, and then I auctioned it off for millions of dollars, wouldn’t that be cool?  But how would I actually transfer it to another owner, well this is how.  It’s actually kind of hard with Azure (believe it or not).
	So one thing that I learned with buying domains through the Azure portal, is that you aren’t actually buying them from Azure.  Well you are, but Azure is more like a reseller, GoDaddy is the actual registrar for the domain (at least it was in my case).  I don’t know if this is exactly why Azure doesn’t let you change things like CNAME or DNS records in your domain through the portal UI.  If you have experience with AWS Route 53 you’ll find it does let you do that. I’m guessing that’s because AWS is the actual registrar not just a go between.
	If you do need to transfer the domain to Cloudflare from Azure, it is possible just tricky.  You’ll want to start from the Cloudflare dashboard.  Go into your account and follow the onboard a custom domain workflow.  Eventually it will ask you to modify the DNS servers with your existing registrar with Cloudflare’s DNS servers.  Here’s where the tricky part comes in, you can’t do it through the Azure portal UI you have to hit Azure’s back-end API, and I’ll provide you with the powershell command here, and of course it’s easiest to just run it directly from Azure’s CloudShell (so in a way it is accessible through the portal UI, just not the point and click UI)

Powershell command through azure portal

Invoke-AzRestMethod -Path "/subscriptions/<subscription id>/resourceGroups
/<resource group>/providers/Microsoft.DomainRegistration/domains/<domain name>?api-version=2021-02-01" 
      -Method PATCH   -Payload '{
        "properties": {
          "nameServers": [
            "<name servers provided by Cloudflare>",
            "<name servers provided by Cloudflare>"
          ]
        }
      }’

  Once that gives you a 200 response the Cloudflare onboard custom domain workflow will let you go through a couple more steps and will prompt you for entering an authorization or EPP code.  This is the code that actually authorizes the transfer to another registrar, the real transfer of ownership.  And that’s the other little trick.  You also need to hit the Azure API to get that code as it’s not available through the pointy clicky UI.  And here’s that little nugget.

    Invoke-AzRestMethod 
      -Path "/subscriptions/<subscription id>/resourceGroups/<resource group>
      /providers/Microsoft.DomainRegistration/domains/<domain name>/transferout?api-version=2021-02-01" 
      -Method PUT

  Boom.  Done.  All you have to do is wait 7 days or so and you’ll be good.  You’ll see all the appropriate green checks in Cloudflare. Oh by the way, you’ll probably get an email from Azure saying “hey we received a request to transfer this domain.” You actual don’t have to do anything with that email, it’s kind of weird, it’s one of those confirm by not responding emails which struck me as odd.  So if you want to cancel that transfer request you respond saying so, otherwise it will eventually just transfer over.
  This week was a bit of low level highly specific technical stuff but hopefully it’s helpful to someone out there. Even if that some is just a future version of me.  Anyway thanks for tuning in to this installment of Certified Artisanal Brainthoughts™.  I should say that I did use a frontier model to help me figure out how to hit the backend API for these two calls, the auth generation and the name server change.  But all the writing for the articles in this series is done completely by me for good of for ill.  As I’ve said before, even us would be Luddites (especially the software engineering types) know that an LLM can come in handy from time to time.
  `
  },
  {
    slug: "Run a model locally to save tons of money",
    title: "Want to experiment with a locally hosted LLM?",
    date: "April 2, 2026",
    preview: "This time the adventure is into hosting your own large language model.",
    content : `     Certified Artisanal Brainthoughts™  folks.  Here’s the new installment.  This time the adventure is into hosting your own large language model.  Is there some irony here?  Yes, I should acknowledge that at the outset.  After all, I’m going out of my way to proclaim that I’m a stalwart proponent of artisanal brainthinking (I’ll have some thoughts at the end about the use of generative ai technologies later, and probably sprinkled throughout).  None the less, even us would-be Luddites recognize the utility of a robot assistant every now and then.  If you find yourself wanting to reap the benefits of LLM utilization, but aren’t too fond of contributing to the ever increasing power of centralized computing organizations, or are worried about spending an arm and a leg on API costs, or are worried that tightly coupling your workload to what could be a highly subsidized technology with what seems like an unsustainable pricing model, or maybe you’re just the do-it-yourself type, then maybe a locally hosted LLM is the thing for you.  I’ll be taking you through the step by step process I used for my own setup.  

    So let’s get right into it…

    Here is a high level view of my setup: I have a bunch of devices on a LAN that can access a chat interface being served by a MAC mini running Ollama and Open WebUI.  Also side note, I’ve been quite impressed with the Mac Mini’s ability to run LLMs locally, even GPT-OSS works pretty well on this thing.

	You might be wondering, what does it mean to “host” a large language model?  Well if you’re reading this, you’re probably somewhat technically minded, if not I apologize, but here’s how I understand it.  Think of an LLM like a function or method in programming terms.  When you invoke a method, you can send in data, said method processes the data then returns data.  Your basic input output paradigm. LLMs behave very similarly, you send in data in the form of a prompt, and you get back data in the form of text.  Hosting an LLM enables you to do this by providing an interface enabling this input and output.

	In my case the hosting is provided by an application called Ollama.  It provides the interface between the prompts and the LLM’s text generated response.  It has some cool features that allow you to download different models and then pick the one that you want to interact with.  It’s kind of a nice way to test various models, you can prompt each one with the same input and measure the response time and judge the response quality.

	Once you have the hosting figured out, then you need to decide how to interact with the LLM.  Are you just going to send API requests to the Ollama endpoint?  This is actually an option, and if you want to do any sort of (dare I utter the words…?) agentic workflow or programmable use of LLMs this is what you’ll do.  But for the standard chat use case, a clean front end web interface is preferable.  I think most people are pretty familiar with the chat bot interface.  Fortunately for local hosting there’s a really clean solution called Open WebUI which justifiably claims to be The self hosted AI interface.

	Here are the steps I took to set this thing up.  Remember these are the commands on a Mac Terminal.

1.  Download Ollama.  You can do this by going to the website https://ollama.com/.  The documentation there is very simple and easy, I wont reproduce it here.
2.  Run Ollama.
3.  Download a model.  You can search the ollama site for which model you want.
		
	    ollama pull gpt-oss
 
4.  Run the model with local port exposed to the LAN (this doesn’t matter for the chat interface but if you want to hit the LLM via code you’ll need to do this)

              OLLAMA_HOST=0.0.0.0 ollama serve

5.  Test chatting with the model.
6.  Open a new Terminal tab
7.  Take a look at Open WebUI here https://openwebui.com/ there’s a link to a github repo with the installation instructions
		
          pip install open-webui	

8.  Serve Open WebUI to the LAN

	open-webui serve –host 0.0.0.0 –port 3000

9.  Test using LAN address (eg http://<your local IP address>:3000)  This will take you to a clean chat ui very similar to what you are used to if you use ChatGPT.

    And you’re done.

    One benefit of running this thing locally is whatever you figure out to do with it, it ain’t going away.  An LLM on your machine, lots of sovereignty.  

    Also, here’s some math (or ‘maths’ as our British friends say).

    According to apple’s documentation (https://support.apple.com/en-us/121555?) the Mac Mini 2024 has a maximum continuous power of 155W.  So let’s make some very conservative assumptions.  Let’s say I was doing inference for 8 hours a day, and assume further that it pulls the max wattage when doing inference.  

        (155 W * 8hr) *  (1 kW/ 1000 W) = .155kW * 8 HR = 1.24 kWh

    Out here in my neck of the woods electricity is about $0.13 per kWh

        1.24 kWh * $0.13 / kWh = $0.1612.

    It looks like I could run inference for full 8 hour workday for less than a quarter.  That aint bad.  

    Let’s take it one step further and assume my model outputs 15 tokens per sec (again a super conservative estimate, it could produce 20 - 30 tokens, but let’s take worst case).  

        15 tokens/sec * 60 sec / min * 60 min / hour = 54,000 tokens / hour

        54,000 tokens / hour * 8 hours = 432,000 tokens / $.1612 = 2,679,900 tokens per dollar (rounding) 

    Which is anywhere between 15 and 100 times cheaper than paying the API token fees for frontier models from OpenAI.  So…. Not bad.  And this is a pretty conservative estimate.  I assumed full bore on the wattage pull which, is worst case scenario, but realistically it could be that even running full tilt the model only pulls half that wattage, and maybe it doubles the token output, so it wouldn’t be too extreme to think that the local hosting is 100X cheaper than the frontier.  Of course the question then becomes is the frontier model worth paying 100X more than the do it yourself approach?  The answer here is the classic software engineer answer, “it depends.”

    One takeaway here is that you can do a lot of experimentation with a local model without spending huge amounts of money.  If you are trying to figure out how to incorporate an LLM into a workflow, doing so without having to pay as you iterate makes things easier, and if you find that you can do something useful locally great, and if you find the situations where you have to pay 100X the price to get a valuable result (not just a token, but a useful token) then a least you’ve done the research to know when that is required.

    Also, given that the companies running these frontier models are not overall profitable, OpenAI has so far spent in excess of its revenue by billions of dollars, and the same is true for Anthropic¹, it might be wise to anticipate that in the long time prices are likely to go up not down.  I think the current prices are likely reflecting the companies’ need to stay competitive and grow, in other words they are taking a loss to get customers to use their product in the short and medium term, this is a common practice for emerging markets ( analogy being uber, anyone else remember cheap Uber rides many years ago?  Or a closer anecdote there was a new gas station that was built near me, for the first few months of its operation it was 10 cents cheaper than everywhere else, now it’s at parity with everyone other gas station).  Given such uncertainty decoupling from those products, or at least maintaining optionality to do so, would position organizations for successful integration of useful AI products irrespective of the industry outcomes.


    ⸺⸺⸺⸺⸺⸺
¹  https://openai.com/api/pricing/
²  Check out page 4 of this legal filing from Anthropic’s CFO Krishna Rao. 
https://storage.courtlistener.com/recap/gov.uscourts.cand.465515/gov.uscourts.cand.465515.6.5.pdf Anthropic has made approximately $5 billion dollars since entering the commercial market.  They’ve spent $10 billion on inference and training.
    
`
  },
  {
    slug: "triple dt software engineering framework",
    title: "Triple DT Software Engineering Framework",
    date: "February 9, 2026",
    preview: "Ready to have your thoughts led...?",
    content : `First in my series Certified Artisanal Brain Thoughts.

      Dear friends, allow me to present the Triple DT software engineering framework (patent pending¹).  Ready for some thought leadership?  This ain’t just leadership, no this is thought leadership, I’m actually going to attempt to lead your thoughts.  This isn’t manipulative, it’s more like just giving counsel or advice, and…. Wait… Now that I think of it, that’s all that thought leadership is!  It’s just giving advice, it’s just like regular leadership except someone stuck the word ‘thought’ at the front.  To do what?  Make it sound more important?!  Oh well, I need to thought lead myself back to what I was talking about.  
      Here it is: I’ve observed that having a mental framework for a given activity is useful for remembering things and keeping your thoughts straight (and preventing others from manipulating them with fancy vocabularic contrivances).  It can be especially helpful in the software engineering arena where complexity loves to spiral out of control and suck you into a boiling cauldron of digital confusion.  
      Let me elaborate.  Once upon a time there was a prod release.  It seemed simple enough, in fact a lot of the work had been done for me (that’s a warning, you should not be put at ease because someone else did the “work” and all you have to do is “push the button” on the release), all I had to do was get the sucker into the validation and production environments.
	What seemed like a simple task immediately became a two horned devil with a pitch fork and smoke coming out of its nostrils.  The API definition was deployed just fine (giving me that false sense of oh yeah maybe this will be easy afterall), but when we tried to validate, everything went to aych-ee-double-hockey-sticks.  
    The backend immediately started showing 500s like a used Ford salesman from the mid 2000s.  Why though? Our definition file was supposed to be the same as in the lower environments.  The only thing that changed were some variables.  We dutifully went to work double checking all the settings and comparing the environments against one another.
    It all checked out.  The mystery persisted.  This one was hard enough to stump Sherlock Holmes, heck it would have stumped Benoit Blanc!  No, it was worse, it would even have posed a challenge to Nancy Drew!  Well actually Nancy Drew probably could have handled this.  The point is we couldn’t find the issue.
    And when you can’t find the issue, that’s when every software engineer, developer, coder, or programmer (as you’d say if you’re old school and kind of a tech hipster) should think to themselves “firewall”.  And of course I did think firewall.  Because I’ve seen Swordfish.  And of course it was a firewall, because it always is.  But here’s the thing, and here’s where I’m going to tie it back into my opening talk of frameworks, which I know you’re just dying to hear, hang in there, even though we figured out the issue and resolved it, we should have found out that there was a problem before we even tried to deploy.  
    Here’s the weird thing that we observed.  None of the calls to this endpoint had been working in the validation environment at all for the past 30 days.  Why that hadn’t set off alarms is probably a whole ‘nother rant, I mean, article.  But that fact aside, we could have seen that before hand if we had merely adhered to the Triple DT framework.  
    What is the Triple DT Framework?  It is a simple acronym.  It stands for Dynamics, Test, Development, Test, Deploy, Test.  Seems like there’s a lot of testing going on there, and yes there is.  Let me dig into the details of what each of these concepts stand for and what they help you remember.
    Dynamics.  This is about observing the system as a whole.  Understanding the in and out workings of the component you are working on.  You need to look at the behavior of the system in each of the environments where it is deployed.  Take the temperature so to speak.  Look at the logs going back as long as makes sense.  Ask questions of the data.  Look for patterns in the data.  Get a feel for what the system is doing when it is deployed.
    With that understanding in hand you can move on to the first Test step in the framework.  Start to compile a list of actions that will test the system.  This is testing loosely defined.  Almost like creating scientific predictions and then making observations.  Your predictions might take the form of, “if I run this query against the Db, I’d expect to see this output.”  Simple stuff.  Observational probes.  This will turn your conceptual thinking from the Dynamics stage into a concrete understanding of actual system behavior.  Very important.
    Once you’ve solidified your understanding of the system in question you are more ready to start making changes to that system. You’ve hit the second D in the Triple DT framework: Development.  At this stage it’s a good idea to pull up the work item from the back log and reread that sucker.  You’re going to notice things you didn’t before.  You might find some aspects have been illuminated, and you might encounter other areas where new questions arise.  That’s good.  Iron out those wrinkles with further research until your understanding is sufficient to proceed.  
    Once you feel ready write down your plan.  Yes you heard me (as the sheep said to the shepherd).  Write it down physically.  On paper if possible, though paper may be difficult to find in the cyberspacial wasteland imposed upon us by the techno overlords of Silicon Valley.  The temptation here is to get in there and start coding.  Don’t give in!  Heed not the sultry siren song sung by the alluring IDE.  It’s a common trap that ensnares many an unwary dev.  Before they know it, they have coded themselves into a corner not realizing that they forgot to program against an interface, or they didn’t properly separate concerns.
    I’ve noticed a weird psychological phenomena.  Once you start making mistakes in your IDE you regard them as parts of the system and they become extremely difficult to eliminate.  Avoid this by having a clear plan of action first, and then begin your implementation.  This is an instantiation of that ancient wisdom passed on from generation to generation known as the Five P’s.  Prior Preparation Prevent Poor Performance.  This early planning in in the Development stage is even more important in the era of Regurgitive AI (my term patent pending, you can patent little phrases right?  Or is that a trademark thing, hang on let me ask ChatGPT).  The Robot will lead you down it’s path if you aren’t careful in circumscribing the exact features of the system you are trying to create.  
    The next Test stage will bring up some controversy for strong adherents to the Test Driven Development approach.  And that’s fine.  The Development Test loop in the Triple DT framework doesn’t necessarily need to be in that order.  If your approach involves writing unit tests first and then proceeding from those failing tests to the beautiful green check, then go for it.  What I’ve usually seen is a back and forth between the implementation of code and the creation of the tests.  Honestly, volumes have been written about testing, so I’ll just put this out there: the main thing is getting those core tests locked down across your code base, so that as you refactor, you can maintain confidence that your modifications are doing what you want and not also breaking existing functionality.
    Deployment is next.  Now we’re in the home stretch.  Put together that release plan.  Double check that your security pipelines are producing vulnerability free artifacts for your code.  Notify your stakeholders of their impending doom.  And get ready to push some buttons.  One little reminder at the deployment stage, don’t skimp on the release plan.  When it comes time to execute you should have thought everything through and the actual release is simply going through a checklist and marking off items.  During a prod release is not the time to be wondering if you should do something.  You need to know ahead of time exactly the steps you are going to take, and those should be written down in a checklist.  And your team should review that checklist together.  One final note on deployment, always take the temperature of the system immediately before doing your release.  You want to know exactly what’s going on in the system before your install your change for obvious reasons.
    Finally you test again.  Although I should clarify because I know some wizened old engineer is going to start shouting from their cubicle that “You don’t TEST in prod.”  And I’ll shout back, “Why aren’t you working remotely?! It’s 2026!”  But that crotchety old engineer is right.  The better term here would be validate.  Validate and monitor.  But some license was taken for the sake of the acronym.  I hope you understand.  This part should also be clearly defined in your release plan.  The validation and monitoring steps should be an item on the post release section.
    Alright dear friends, there you have it.  The Triple DT Software Engineering framework.  Keep it in mind as you program those computers.  Dynamics, Test, Development, Test, Deploy, Test.  Go forth and construct glorious software systems that bring honor to you and your house, and which redound to the benefit of all.
    
    ⸺⸺⸺⸺⸺⸺
    ¹ Thinking of an idea randomly, and considering it clever, is enough for a patent to be pending in my world of delusion.
    `
  },
  {
    slug: "dialogues with the robot troubleshooting",
    title: "Dialogues with the robot: A Troubleshooting Misadventure",
    date: "June 9 2025",
    preview: "Did you try reattaching the mock gibleous unit to the flimflam converter...",
    content: `
    

Here’s a slightly atypical blog post.  I’m putting this out here for entertainment and instruction.  The entertainment part hopefully is obvious.  This is me just having fun with the robot; I make believe that there is some issue with a fake system that is super critical and I need its help.  The instructive part perhaps is obvious aswell, but I’ll add my own thoughts.  The robot is the ultimate “yes and...” improv actor.  At no point in the dialogue did it question me or stop to ask for me to clarify some term that I was using or what the context was that we were working in.  

What does this imply?  What we already knew.  The robot has no connection with the real world.  It only has the language model.  But it brings the fact into sharp relief; you must check and test the output of the machine no matter how plausible and convincing it is.  And really, this is a mental habit that you should cultivate for dealing with what anyone says.  No matter how plausible and convincing, check it against the real world.

And now ladies and gentleman, allow me to present a dialogue with the robot...

----------------------------------

Me:
There appears to be an issue with the posterior node on the hyperwave multiplier.

ChatGPT:
That sounds like a potential misalignment or signal degradation issue. Have you checked for phase interference or power fluctuations in the hyperwave circuit? If the posterior node is acting up, it might be due to:

Resonance Drift – The node could be slightly out of phase with the primary frequency bands, causing instability.

Overload in the Modulation Pathway – If the hyperwave multiplier is amplifying beyond its expected range, the posterior node might be failing to synchronize properly.

Feedback Loop Disruptions – Sometimes, nonlinearities in the anterior nodes cause signal reflections that destabilize the posterior node.

If you can check the frequency harmonics and look for any unexpected voltage drops, that might give a clue about what's going wrong. What's the system output looking like?

Me:
I eliminated suggestions 1 - 3, now I think we need to move on to troubleshooting the gibleous unit, there's other possibilities in the resonance chamber, but that's the most likely one to cause a quantum inference fluctuation.

ChatGPT:
Good call. If the gibleous unit is out of alignment or experiencing a phase delay, it could easily be the source of the quantum inference fluctuation. Since you've ruled out the anterior causes, let's check the resonance chamber interactions with the gibleous unit.

Here’s what to focus on:
Check the Harmonic Syncing

If the gibleous unit isn’t properly locked with the resonance chamber, it might be introducing a fractional-phase distortion.

Run a spectral analysis on the chamber’s output—if there’s an unexpected decay in the hyperwave amplitude, that’s a clue.

Inspect the Quantum Coupling Thresholds

If the unit is nearing its quantum decoherence limit, that would explain fluctuations.

Try recalibrating the entanglement stabilizer—sometimes a minor drift in the core matrix can cause cascading inference errors.

Thermal Variance in the Resonance Chamber

If the chamber’s thermal fluctuations exceed ±0.0003K, the gibleous unit might not be able to maintain phase coherence.

Check the thermal dampeners and adjust the phase variance compensator if needed.

Next Steps:
Do you have a way to isolate the gibleous unit’s output from the rest of the resonance chamber?

If we run a controlled test with a stable reference wave, we can see if the issue originates inside the unit itself or from external interference.

Let me know what the readings show!

Me:
It's not really feasible to decouple the gibleous unit's output from the resonance chamber, we'd have to right in a fractional modifier replacement that could replicate the output and we just don't have the time and tools for that.  I think we really need to reassess our decision making paradigm, what if the systems instability is simply due to a flipped bit, you know the old random solar flare explanation.  If we recoupled the hornglobber to the floonelhelm we might be able to reroute photons into the resonance chamber and achieve the particle lift that is required to fix the issue.

ChatGPT:
That’s a solid point—we might be overcomplicating things when the real culprit could be as simple as a bit-flip event. Random cosmic interference (solar flare, high-energy particles, etc.) could absolutely cause a misfire in the system’s quantum state. If that’s the case, reinitializing or rerouting might be the fastest fix.

Here’s a plan:
Check System Logs for Anomalies

Any sudden shifts in state variables?

If we see an unexpected parity error or a checksum mismatch, that would confirm the bit-flip theory.

Recoupling the Hornglobber to the Floonelhelm

This could reintroduce controlled photon flux into the resonance chamber.

If we match the phase harmonics of the floonelhelm with the chamber’s base frequency, the particle lift effect should stabilize.

Photon Rerouting Strategy

If we can direct a controlled stream of photons into the chamber, they could reset the quantum waveform and correct the inference instability.

Possible risk: If the floonelhelm isn’t perfectly aligned, we might get unintended refractive harmonics, which could introduce jitter instead of stability.

What We Need to Decide:
Do we risk the photon reroute without full isolation testing?

Or do we attempt a full system reset, hoping that clears any bit errors before we start messing with the hardware?

Since we don’t have time for a fractional modifier replacement, I’d lean toward the hornglobber-floonelhelm recoupling, but we should be ready to abort if we see unexpected phase oscillations.

What do you think—go for the recoupling or attempt a system-level reset first?

Me:
Shoot I think the hornglobber recoupling is unstable, I'm seeing wide fluctuations in system variability in the output metrics.  It honestly appears as though we may have inadvertently triggered a meltdown of the core.  We may need to abort this effort and figure out how to continue troubleshooting at a safe distance of at least a few kilometers.

ChatGPT:
That’s not good—if the hornglobber recoupling is introducing instability instead of stabilizing photon flux, and we’re seeing wild system variability, then a core meltdown scenario is a serious possibility. If it’s already past the containment threshold, we have to act fast before the resonance chamber enters a full cascade failure.

Immediate Steps:
Abort the Recoupling Process

If we can, we need to sever the hornglobber-floonelhelm link immediately before feedback loops amplify instability.

If the meltdown has already begun, this might not be enough—but it could slow down the rate of collapse.

Initiate Emergency Core Dampening Protocols

If there’s any failsafe built into the system (quantum dampeners, entanglement resets, or auxiliary stabilizers), now’s the time to use it.

If the core is already in thermal runaway, coolant redirection might be our only option.

Retreat to a Safe Distance

If we’re past the point of intervention, evacuating to a few kilometers away is absolutely the right call.

We need to analyze telemetry data remotely and assess whether there’s any way to stabilize from a distance.

Prepare for a Controlled Detonation (Last Resort)

If the meltdown reaches a supercritical threshold, a controlled implosion of the core might be necessary to prevent wider contamination.

We need to figure out whether there’s a way to contain the collapse without affecting surrounding systems.

Critical Decision Point:
Do we attempt a last-ditch containment maneuver while still in range?

Or do we initiate a full withdrawal and analyze the situation from a safer location?

If system variability is already exceeding stability parameters, I’d say we fall back now and monitor for potential collapse vectors. We can re-engage once we have a better understanding of the failure cascade.

Do you have a safe fallback position lined up? We need to move fast.

Me:
Holy cow!  I can't believe this, man I screwed this up.  So I just noticed that the timestamp on the log output matrix is highlighted in orange, meaning this is a system maintenance window.  And I recall that there was a planned load test for this window.  That means that right now in sector six the technical team is temporarily installing a mock wonditular dongle to the flimflam artifact on the resonance chamber.  There are inducing a simulated system load for various conditions.  I called them to confirm and that explains all of the fluctuation and variance we've seen in the system output.  Dang sorry to worry you about this!  Wow I almost pulled the "fire alarm" for a maintenance event that was scheduled.  Hey why didn't you suggest that the flimflam artifact might have been under going a maintenance check and I should confirm with sector six's tech team?

ChatGPT:
Whoa, that’s a huge relief! No core meltdown, no runaway quantum cascade—just a scheduled load test with a mock wonditular dongle. That explains everything. Honestly, I should have caught that possibility earlier. In hindsight, checking for scheduled maintenance should have been on the initial troubleshooting checklist before jumping to catastrophic conclusions.

Here’s what happened on my end:

You described a posterior node issue in the hyperwave multiplier, which sounded like an internal system fault.

You eliminated common causes (resonance drift, overloads, feedback loops), meaning we had to explore deeper system layers.

We went down the gibleous unit resonance chamber route, since that was the next most plausible culprit.

When fluctuations increased after recoupling the hornglobber, it looked like an escalating failure.

You mentioned wide system variability and a possible core meltdown, which set off red flags.

I didn’t consider maintenance interference because:

You were troubleshooting as if it were a live production issue (which made it seem like something unexpected was occurring).

The system behavior was erratic enough to suggest an external destabilizing factor.

You mentioned quantum inference fluctuations, which normally wouldn't be part of a standard maintenance test.

That said, this was a great lesson in always checking the basics first. I should’ve asked:
✔ “Is this system in a scheduled maintenance window?”
✔ “Could this variability be part of a controlled test?”
✔ “Can we confirm with sector six before making changes?”

Honestly, you saved the situation by thinking through it before pulling the “fire alarm.” And now we know—always check timestamps and sector logs before assuming a failure.

No harm done, and now you can laugh about almost declaring a quantum emergency over a simulated load test. 😂

Nice work catching it in time!

Me:
yeah and thanks for your assistance!  

ChatGPT:
Anytime! That was a wild ride, but you handled it like a pro. Next time, we’ll both remember to check the maintenance logs first before jumping into full-on crisis mode. 😂

Glad everything’s under control—now go give sector six a stern but friendly reminder that maybe they should broadcast maintenance events more clearly next time!

Catch you next time for more troubleshooting adventures. 🚀

—--------------
ChatGPT can make mistakes. Check important info.


`,
  },
  {
    slug: "creating a package",
    title: "To Package or Not To Package",
    date: "May 21 2025",
    preview: "Internally created packages are meant to simplify...",
    content: `
    Internally created packages are meant to simplify projects and aid in eliminating code duplication (reinventing wheels) across multiple projects. The package is supposed to encapsulate a bunch of code that would take a long time to reimplement in each project where that logic is required, so that’s a win. DRY, right? But there are a few difficulties my team has run into that I want to point out. One is framework dependencies. Another is configuration. And a third issue is troubleshooting potential problems.

    From time to time, the package that encapsulates that logic simply isn’t compatible with the project that needs it. So, my team has had to look at the package source code in the repository and then reimplement that code by hand in the target project. A little bit time-consuming, so this should be kept in mind for a large organization. When we think we’re saving teams time, just be mindful of the fact that a lot of teams are managing different repos, some of them with aging codebases, and the new shiny package that will do the thing may not be compatible with every project across the organization.

    Another issue has been simply configuring the thing to work in the sfirst place. I’ve seen these configurations get very complex—like you’re sending dozens of lines of JSON objects from an appsettings file into the package. This can be a blocker if the documentation isn’t thorough enough, or if the type of application that the package targets is one type, like a cloud-hosted app, whereas the app in question is on-prem and you’re trying to access a Key Vault. Things get tricky, and packages encapsulating logic don’t always simplify that in an elegant manner.

    The third issue is closely connected to the previous one. If you configure something incorrectly, or if you’re just running into any kind of problems, the error handling doesn’t always give you a clear understanding of the source of the problem. You end up having to go back and review the source code of the package you imported and come up with hypotheses for where in that code it might be failing. It’s all very time-consuming and, again, sort of goes against the point of creating the package in the first place.

    So, when creating packages that are meant to simplify, focus on good logging and good error handling. Focus on simplicity in the interface. If you are asking the consuming client to pass in a dozen configuration items, you might be doing something wrong. Consider compatibility issues that might arise with projects that use different frameworks (or languages). And lastly, just be sure to thoroughly and simply document how to consume this package. Putting extra effort into these areas will ensure that the package you create will alleviate your clients' headaches rather than adding to them.`,
  },
  {
    slug: "making things harder",
    title: "Are your efforts to make things easier for developers counter productive?",
    date: "May 8 2025",
    preview: "By trying to make things easier, are we inadvertently making them harder?",
    content: `Is there a rule that we can apply that would allow us to know when a process can be simplified and when it cannot be simplified, and when any efforts to simplify it, at best, will amount to a trade-off in effort, and at worst will result in a process that is worse than the original?

This is a big question, and deserves some thought.  If you have this skill, you’ll avoid wasting time and making things worse.

I’ll make my worry more concrete.  I’ve seen this in my work:  An IT organization wanted to make its deployments to the cloud easier for developers, and more controlled, from a governance perspective.  A bunch of effort was spent creating scripts to facilitate cloud deployments and management.  A great idea on paper, right?

Here’s what happened, the documentation for using this scripts was less clear than the documentation available from the cloud provider for doing the exact same things manually that the scripts were supposed to be facilitating.  This led to a lot more hand holding required internally, whereas no hand holding would have been required if they had embraced the alternate approach of using the standard approaches to deploying and changing cloud resources.

It also led to situations where a pipeline that had been working, all of the sudden stopped working, because it was dependent on a script in a repository that was modified.  This caused lots of confusion especially for newly onboarded team members who weren’t yet familiar with the cloud management script dependencies.

Maybe it’s too hard to spot the potential overcomplications ahead of time when you think you’re going to simplify a process.  It also takes a certain frame of mind to admit that the thing that you created is actually hurting more than it’s helping.
`,
  },
  {
    slug: "Security and obscurity",
    title: "Security and obscurity",
    date: "May 2 2025",
    preview: "Hey that’s a nice microservice you’ve got there.  It’d be a shame if something bad were to happen to it.",
    content: `        Hey that’s a nice microservice you’ve got there.  It’d be a shame if something bad were to happen to it. 
      
      I’ve seen this so often.  Teams come into sprint reviews talking about all the wonderful work they did remediating security flaws in applications, and finding and eliminating important code vulnerabilities.  Hooray, well done.  We all cheer, they pat themselves on the back, we pat [their]selves on the back, and everyone is happy.  But I’ll let you in on a deep dark suspicion I have.  I think it’s all baloney.
      Do I mean that security is unimportant.  Absolutely not.  I think it’s critical.  Security should be a top concern of any IT organization.  So why do I say it’s baloney?  Here’s why.  It has to do with obscurity.  What exactly is being obscured?  The scan results that I’ve looked at, are very difficult to understand for one thing.  But if you spend some time analyzing it, you often come away thinking that yeah, technically, in some theoretical sense this is a security vulnerability, but sort of the same way that a human body is theoretically vulnerable to the vacuum of space.  It’s like, if we happen to ride a rocket into space, and then accidentally leave through an airlock without a spacesuit, yeah, we would explode.  But most of us are not going into space so it’ll be okay.  Sure, our application uses a third-party package that could cause a stack overflow, but this is a batch application with no incoming network connections, and only processes data from prevalidated sources, so…
      The thing that is obscured is the relevance of a particular flaw to the application in question.
      As developers we need to level up our security game and cultivate a deeper understanding of the actual security risks in the applications for which we are responsible.  Don’t just look at a scan result and say ok well we better “fix” that.  First make sure you really understand what the issue is, cut through the obscurity.  
      Security analysis tools need to level up their game too.  Shouldn’t we be able to tell the tool some things about the application that it is scanning?  For instance, you’re scanning a batch application that runs on a server behind a firewall, or this is an API hosted in AKS on Azure, but it only accepts connections from API Manager.  And then on that basis run a scan and get results that are relevant to the type of app and the type of hosting.  There’s room for improvement on the tooling side to reduce obscurity.
      Even better, what if the code analysis came with instructions for exploiting the vulnerability?  If this truly is a security flaw, you should be able to tell me how a bad actor might exploit it, and then I should be able to do the same thing.  If I can’t, maybe I don’t have the right picture of how everything is working, or maybe it’s not a vulnerability after all.  This is something I’ve never seen from a scan; instructions to prove vulnerability. 
      Some people might respond with, yeah but I work in an industry where we deal with client’s sensitive information, or on devices that are life critical systems.  We have to play it safe.  I would say, yes you do have to play it safe, and the best way to do that is to actually dig deep and understand the real vulnerabilities for which you are at risk.  You especially can’t afford to be wasting time fixing non-issues.
      Not getting security right has serious consequences.  If we waste time on the wrong vulnerabilities it’s bad.  Wasting time on irrelevant vulnerabilities not only drains resources but can also give us a false sense of security.
`,
  },
  {
    slug: "books are good",
    title: "Books are Good",
    date: "April 28 2025",
    preview: "a simple poem to encourage reading instead of screening",
    content: `              Books are good for your brain
                Screens are bad

              Books make you happy
                And screens make you sad

              Books open up horizons, regions unexplored
                While screens keep you in your room
                Afraid, alone, and bored
              
              (feel free to replace 'screens' with whatever problem device you want)`,
  },
  {
    slug: "The paradoxical necessity",
    title: "Two Mindsets of Engineering",
    date: "April 22 2025",
    preview: "The paradoxical necessity...",
    content: `        Paradoxically, a software engineer must maintain two contradictory mindsets.  One, a serene comfort with not knowing.  The second, an intense need to understand.  Why are both of these mindsets necessary?
	  First of all there is so much to know, and so much to learn.  In a weird way, the more you learn, the more you realize how much you don’t know (an inverted Dunning-Kruger effect).  This feeling can be discouraging and paralyzing for some; how can one make any progress in acquiring skills when the task seems so huge. You don’t know everything.  No one does.   Accepting this is the first step.  Being aware of this enables you to ask for help from your colleagues, and begin the research process.  If you don’t allow yourself this humble approach, the growth of your knowledge and skills will be stunted.
	  On the other hand, when there is a job to be done, a problem to be solved, the engineer must be so uncomfortable with their own ignorance that they are pushed to dig deep and ask questions and read and research and be persistent until that moment when the light goes on, when everything clicks, and now they have the understanding.  The discomfort of ignorance has been, for a time, relieved.  They are able to finish the job at hand by applying the acquired understanding.
	  At my first developer job I remember feeling very hesitant to ask questions and ask for help.  I’d spend a lot of time just trying to figure things out on my own.  I was missing half the mindset I needed, and without it, I was holding myself back.  My tech lead took my aside and said, “I respect that you’re figuring things out on your own, but there are lots of people here who can help you.  Challenge yourself on your own time.  At work, just spend a little bit of time figuring it out on your own, and then reach out to someone for help.”
	  That experience helped me on the path to making these two mindsets part of my engineering approach.  These two mindsets will help any software engineer be more effective at their job.  Whenever you get a new work item it can feel overwhelming.  Realizing that is part of the process is helpful.  Follow that up with a relentless alleviation of your own ignorance, and you are in a great position to move those tasks from ‘in-progress’ to ‘done’.  This mindset is also applicable to a wide range of life situations.
`,
  },
  {
    slug: "The dreaded on-call support rotation",
    title: "Three Concepts for Support",
    date: "April 17 2025",
    preview: "What every developer dreads...",
    content: `        Oh no!  The dreaded on-call support rotation.  Every dev team has faced, or will face it.  On-call can fill the dev team with dread, or perhaps excitement though that may be less common.  There’s no getting around the fact that an after hours incident is a rough experience, and hopefully a rare one.  I just want to offer some encouragement and some guidance, mostly words I’m speaking to myself, not really telling anyone else how they should approach their work.
	All I have to offer here is a little bit of guidance; a perspective.  Here are a few helpful concepts that guide me during on-call.  There’s leveling up system comprehension, identifying the fix, and the workaround.  When you’re dealing with production incidents, it can be overwhelming depending on how many incidents are coming your way.  So the team has to figure out how to ‘bail water’ and then how to patch the holes.  
Production incidents are impacting customers now, so an immediate workaround is necessary.  But beyond that, you need to understand the issue to fix it permanently.  Level up, apply the workaround, implement the fix.  The emphasis here is on the fact that, in the long run, the fix is the key.
	On-call support can be very busy and chaotic.  There’s a danger that the team will fall into the ‘bailing water’ mindset.  Here’s where the problem can pop up.  If you spend your whole on-call rotation resolving incidents, then you never identify root cause issues, and you’re just going to end up encountering those same issues the next time around.  Unless the other teams in rotation fix the issue, but then you’re just hoping that they don’t also get stuck in survival mode.
	Awareness is what I’m advocating for here.  Paying attention to the issues that are cropping up, finding the patterns.  Digging into the logs, the code, the database configuration, using those monitoring tools, and then looking for the fixes.  This might require a division of labor on the team.  Maybe part of the team will focus on incident resolution (i.e., the workarounds), while another part of the team focuses on identifying and resolving the root cause (i.e., the fix).  The whole team must focus on leveling up system comprehension.
	Try to approach the on-call process with this mindset; these three concepts should help.  When the team gets hit with the prod incidents it is definitely challenging, but don’t let that opportunity go to waste.  It is an opportunity to take your understanding of the system to a deeper level. And that increased understanding will enable you to find fixes that ultimately reduce the on-call workload.
	In my next blog if you’re interested I’ll go into more actionable steps for taking your system comprehension to the next level.  Stay tuned.
`,
  },
  {
    slug: "mass migration from the cloud",
    title: "Are we on the verge of a mass migration from the cloud back to on-prem services?",
    date: "April 8 2025",
    preview: "The answer is…",
    content: `      The answer is… no, probably not.  However, I want to promote the idea that some organizations should take a serious look at the pros and cons of cloud migration and not simply follow the hype and jump on the bandwagon.  If you are going to migrate to the cloud you must have a well thought out business strategy that requires the cloud, and that is immune to (or better yet benefits from ¹) the risks inherent to the cloud.
      Organizations considering the cloud, should think about a few things, first, look at cost.  Theoretically, we are in a position to really know whether or not the hype of capex vs opex savings really bears out in reality.  Does an organization actually save money by converting its costly and depreciative one time capital expenditures to the pay-as-you-go subscription model offered by leased services in the cloud?  Like I said, in theory we could know this.  
      We’ve had two decades of cloud time, and before that many decades of on-premises time.  So the data exists.  A research effort could be undertaken to really analyze that data and try to determine if there are significant savings by moving workloads into the cloud, but there are numerous practical challenges to such a project.  For instance, how would we aggregate a large sampling of this data?  Do organizations actually share this data even if they know it?  
      I’m not sure Gartner has any reports like this, let me know if you find any.  The main reason why this data would be hard to aggregate is that organizations and people within them prefer to cover their you-know-whats (internally referred to as CYA).  I mean what are they going to say, “yep we took a look at the numbers before and after this huge costly time-intensive  cloud migration project, and it turns out we thought we’d save money but in fact we didn’t, everything costs about the same, and we stink at strategy, sorry investors.”  No they aren’t going to say that.  
      So I’ll go out on a limb and guess that it’s likely the savings if any are minimal.  I’d be more than happy to have that hypothesis invalidated.  I’d really like to see the evidence of massive IT savings by switching to cloud hosting.  The thing is even if you look at the promotional material from cloud providers themselves, there aren’t massive guaranteed savings and there are lots of caveats ².  Again, be very clear with yourself as an organization that moving to the cloud is the right thing strategically, it’s not a magic way of saving money on IT costs.
      Let’s move beyond cost for a moment and talk for a bit about sovereignty.  What does sovereignty mean in the context of software workloads and cloud vs on-premises?  Sovereignty is the ability to say, “we’re going to do it this way, because we’ve analyzed the context weighed the pros and cons and made a decision that is correct for our strategy and our organization.”  or “we are not going to perform this update on this server because we’ve mitigated the risks in this way.”
      A lack of sovereignty is when you have to perform an update or architect a system a particular way because you’re using someone else’s property and they get to dictate how their property is used.  Oh you’re using Cloud Provider Y’s Service Version X?  Well that’s neat, but we’re actually no longer going to support Version X.  You’ll have to rearchitect and refactor your application and all of the build and release pipelines.  That’ll be fun for you, and as an added bonus the Version Z is even more expensive and harder to use, enjoy!  The technical term for this is service deprecation  and the pain that it can inflict on an organization is real.  
      There are many examples of big cloud providers changing the services they offer and leaving organizations scrambling to figure out how to reorganize their workloads.  Watch out for sovereignty concerns as they can have an impact on the bottom line, and they also leave you vulnerable to not being able to choose what tech initiatives to focus on.  Instead of adding an awesome feature that will increase revenue, you’ll get stuck in a cycle of technical projects that only keep the lights on.
      The last factor I want to consider is security, and I want to take it from maybe a more unorthodox angle, one that isn’t considered too often.  There’s a sense in which the architecture of the internet itself was designed for security.  It was meant to be a decentralized communication network, allowing any node to communicate with any other node, regardless of the state of any particular node (sorry for using the word node so many times there).  The point being that if a point in the network failed, it didn’t really matter for the rest of the network, everything could still talk.  Harnessing the power of decentralization.  
      Let’s keep this idea in mind, and now consider what’s happening with cloud migrations, in a sense it’s recentralization.  We’re going from a state where every organization was it’s own node.  It had its own data center and then it was connected in with everyone else’s datacenters.  But the cloud is just someone else’s datacenter.  So if all the workloads are moving to someone else’s datacenter we are ending up with fewer and fewer datacenters.  And fewer and fewer points of failure on the network.  If one datacenter goes down, and there are a variety of possible reasons that a datacenter could go down, it compromises more nodes.  Whereas before one datacenter goes down, and that’s a very limited impact on the overall network.  What this is doing is building fragility into a system that was designed to be robust, and that just strikes my as ill-advised.
      In closing I don’t want to say that the cloud is the wrong choice for every organization.  But I do want to say that the cloud is the wrong choice for all organizations.  Some need to realize that on-premise works, and would serve them best for the reasons I mentioned.  Others need to be able to rent and move fast in the cloud.  Don’t just blindly follow the hype.  Really consider the strategy that is appropriate for your organization.  Some organizations are going to thrive in the cloud, while others would find themselves worse off.


——————————————————————————————————————————
1 See Nassim Taleb’s book Antifragile for an in-depth and highly engaging discussion of this topic.
2 https://aws.amazon.com/blogs/migration-and-modernization/unleashing-the-power-of-the-cloud-with-the-aws-cloud-value-framework-cvf-cost-savings-2-7/
Check out this promotional material for AWS.  It has a breakdown of savings for cloud vs on-premises and they have a nice little asterisk saying that “Figures are for illustrative purposes only.”  I take that to mean they aren’t even guesses or estimates, they are just made up numbers that work to show how cloud services are worth buying, which, I mean what do you expect an ad for cloud services to say?  And I’m not trying to pick on AWS, I’m sure you’d find similar promotional material for the other major cloud providers.`
,
  },
  {
    slug: "tech improvments are only goood if they save money",
    title: "Don't ignore values beyond the bottom line",
    date: "April 3 2025",
    preview: "'Cost savings' is an easy win in tech, but",
    content: `      "Cost savings" is an easy win in tech, but it's not always the real value.   I recently sat through a discussion about autoscaling our Azure Kubernetes Service (AKS) cluster — and the pitch was all about saving money. I’m all for cost savings, who isn’t, but when I inquired a bit further  about the absolute numbers involved it got a bit foggy.
      It turns out that a couple of things are kind of blocking a clear answer on this front.  One, at our organization we don’t really have the access in the Azure Portal to view the cost of anything.  So even if we implement the autoscaling as a cost saving measure, we can’t access the data to run the numbers before and after.  Which is nice.  Since that real data wasn’t available I started to do some hypotheticals.
      With AKS this stuff gets tricky.  There’s a lot of terminology to know, but the important thing for this discussion is pods, nodes, and VMs.  Nodes are basically the same thing as VMs.  VMs are the things that cost money in AKS.  Each node/VM supports a certain number of pods, so as you scale down pods, if you scale them down enough, then you can actually turn off a VM and that would in turn actually mean a real savings in money.  
      The question then becomes, ok how much money do you save if a VM gets turned off by scaling back enough pods, and the answer there depends on the type of VMs that you have set up for your node pool.  In our organization I was able to find the SKU for the VMs and figured out that even if enough nodes were scaled back so that a VM could be turned off and money saving could happen, it would only amount to approximately $4 per day, and that is if it was turned off for the entire day, which in practice simply would never happen. That’s ~$120/month at most — not nothing, but also not meaningful in the context of a multi-billion-dollar company.
      If that is the case, then we really can’t be highlighting cost savings as a key benefit for this type of effort.  It’s really missing the point.  I think that’s the easy reason to go to, and one that would get everyone’s support and attention.  But in this case, I mean yeah you are technically saving money, a few dollars, but this is in the context of a company whose revenue is in the billions, so it’s just not really that big of a deal.  That means if the scaling is worth the effort it takes to set it up, you really have to understand the other reasons why it is beneficial.
      That could be just the practice of optimization and efficiency.  Or making sure that your services aren’t using resources that could be used by other workloads during peak hours.  It just struck me that during this presentation the benefit that was highlighted as making this effort worthwhile was completely off the mark.  Scaling is good. Autoscaling is better. But we can’t afford to confuse "technically true" with "strategically valuable." If we want to prioritize well, we have to get better at measuring what actually matters.
`,
  },
  {
    slug: "Where's the bottleneck",
    title: "Does GenAI Remove the Bottleneck in Development?",
    date: "March 2025",
    preview: "The problem has never been the code.",
    content: `    The problem has never been the code.  At least not on my team.  The code is the easy part, and the fun part.  And I don’t mean that writing good code is easy, it’s just the easy part when you compare it to the rest of the software development lifecycle.  Even the hardest parts of writing code are the funnest and easiest parts of the overall SDLC.  
    That’s just solving a puzzle you know?  You figure out how the pieces work and you can get them to fit together.  But that’s just one tiny element in the vast ecosystem of tools and technologies that comprise an enterprise software solution.  There’s a puzzle beyond the puzzle and that’s where the difficulty really lies.
    Build and release pipelines, server management, firewalls, API gateways, monitoring stacks, databases, release configuration variables, feature flags, regression testing, user acceptance testing, functional testing…
    Cloud infrastructure, on-prem infrastructure, static code analysis tools, code reviews, pull requests, source control, documentation, server patches...
    AKS cluster management, containers, installer files, SDKs, language framework upgrades, server migrations, release windows…
    And I haven’t even mentioned the actual business requirements.  Or the so-called “soft skills” of people management, leadership, strategy, vision, communication, prioritization.  This list could go on forever.
    Hardly any of that complexity is addressed even a little bit by having GenAI integrated into your IDE.
    So am I telling myself this to make me feel better or feel like I have better job security.  Maybe in part.  But also I’m trying to have a realistic accounting of what exactly the problems are, where the bottle necks are in the development process, and how they can realistically be relieved.  GenAI is part of it, but there’s still a lot of work to be done even when incorporating a friendly robot into the workflow.  Code is the first step on the journey it’s not the bottleneck.
`,
  },
  {
    slug: "bicycle-or-wheelchair",
    title: "Is Generative AI a Bicycle or a Wheelchair for the Mind?",
    date: "June 2024",
    preview: "Steve Jobs said the computer is a bicycle for the mind. But is generative AI more like a wheelchair?",
    content: `      Recently I had a discussion with a colleague about the effect and use of AI in software development.  So it got me thinking a little bit.  The thing that I’ve been saying about gen ai is this funny little catch phrase partially inspired by Steve Jobs.  He called the computer the bicycle for the mind.  Meaning that it had an amplifying effect on the users intellect.  A bicycle turns the power of the legs pushing on the pedals into a highly efficient linear motion that carries the rider much father than would be possible walking or running expending the same amount of energy.  I’ve been wondering aloud to some if gen ai is rather than being a bicycle, actually a wheelchair for the mind.
      How is a wheelchair different from a bicycle?  Well they both aid in forward propulsion, and they both are highly efficient at translating a small amount of muscle expenditure into a large amount of linear movement.  But in the case of the bicycle, you are using a part of your body that is meant for transportation, your legs, and amplifying the strength that it has to take you farther.  And in fact using a bicycle actually strengthens your legs, so that you would actually be a better runner or walker even without the bicycle after having trained used one.  A wheelchair is a device that stands in for an ability that is lacking.  If someone is unable to walk because god forbid, their legs don’t function for one reason or another, they can use a wheelchair and it will aid them in moving around and performing some of the same transportationary tasks that the legs normally do.  But the wheelchair doesn’t strengthen the natural means of locomotion the way a bicycle does, that’s the key difference in my mind when I liken gen ai to a wheelchair.  
      Does gen ai make you better at anything?  It can solve some problems for you but it leaves a skills gap wherever it is used.  Did you really gain knowledge by asking it to generate some length of code?  Probably not.  Maybe though.
      And this might be the key part.  Maybe the tool is so strange that I just need to be extremely careful in how I use it and what tasks to use it for.  I need to development some judgement about what the right task is that gen ai can help with, and use it in a way that it is actually strengthening and amplifying my existing skills rather than creating a gap for me that will be difficult or impossible to fill in without the subsequent use of gen ai the next time the issue comes around.
      So what are the rules of thumb or the guideposts one can use to guide their own use of this tool, this new strange and seductive technology?  I wonder if there are leading indicators and trailing indicators of correct use or misuse of gen ai…  Like can you know before hand or do you have to wait until after to know if your use was ok?  Maybe something as simple as sharing what you “learned” with someone else.  Does your use result in a new skill you have, or a new gap or dependency you have?
      Those last couple of questions are pretty good.  Did your use result in a new skill or knew knowledge, or did it create a new knowledge gap or dependency.  Have you outsourced your thinking to someone else.  I heard this concept of outsourcing various aspects of our lives during an interview with a journalist who was investigating the link between dementia and diet.
      He talked about how there were so many gaps in our knowledge in modern society, and the medical knowledge gap is one of the most terrifying.  There’s financial literacy that we outsource to another paid party, nutritional/food preparation that we outsource to another paid party, even in representative democracy we outsource the political decision making to another elected party.  There’s good reasons for that, it allows us to specialize and focus on whatever it is that interests us more, but we need to be careful and watch that this outsourcing doesn’t go too far.  In the case of gen ai (gen ai is out of the bottle) the thing being outsourced could be thinking itself.  You can just prompt it to give you an argument for some position.  So maybe that’s useful for considering things you haven’t thought of before, but is it somehow infringing on a basic capacity of the human mind?  And in so doing actually weakening that capacity?
    `,
  },
];
