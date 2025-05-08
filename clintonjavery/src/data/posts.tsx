export type Post = {
  slug: string;
  title: string;
  date: string;
  preview: string;
  content: string;
};

export const posts: Post[] = [
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
    content: `        Hey that’s a nice microservice you’ve got th  ere.  It’d be a shame if something bad were to happen to it. 
      
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
