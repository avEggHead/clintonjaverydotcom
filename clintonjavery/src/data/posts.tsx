export type Post = {
    slug: string;
    title: string;
    date: string;
    preview: string;
    content: string;
  };
  
  export const posts: Post[] = [
    {
      slug: "Where's the bottleneck",
      title: "Does GenAI Remove the Bottleneck in Development?",
      date: "March 2025",
      preview: "The problem has never been the code.",
      content: `The problem has never been the code.  At least not on my team.  The code is the easy part, and the fun part.  And I don’t mean that writing good code is easy, it’s just the easy part when you compare it to the rest of the software development lifecycle.  Even the hardest parts of writing code are the funnest and easiest parts of the overall SDLC.  
  That’s just solving a puzzle you know?  You figure out how the pieces work and you can get them to fit together.  But that’s just one tiny element in the vast ecosystem of tools and technologies that comprise an enterprise software solution.  There’s a puzzle beyond the puzzle and that’s where the difficulty really lies.
  Build and release pipelines, server management, firewalls, API gateways, monitoring stacks, databases, release configuration variables, feature flags, regression testing, user acceptance testing, functional testing…
  Cloud infrastructure, on-prem infrastructure, static code analysis tools, code reviews, pull requests, source control, documentation, server patches...
  AKS cluster management, containers, installer files, SDKs, language framework upgrades, server migrations, release windows…
  And I haven’t even mentioned the actual business requirements.  Or the so-called “soft skills” of people management, leadership, strategy, vision, communication, prioritization.  This list could go on forever.
  Hardly any of that complexity is addressed even a little bit by having GenAI integrated into your IDE.
  So am I telling myself this to make me feel better or feel like I have better job security.  Maybe in part.  But also I’m trying to have a realistic accounting of what exactly the problems are, where the bottle necks are in the development process, and how they can realistically be relieved.  GenAI is part of it, but there’s still a lot of work to be done even when incorporating a friendly robot into the workflow.  Code is the first step on the journey it’s not the bottleneck.
  `.trim(),
    },
    {
      slug: "bicycle-or-wheelchair",
      title: "Is Generative AI a Bicycle or a Wheelchair for the Mind?",
      date: "June 2024",
      preview: "Steve Jobs said the computer is a bicycle for the mind. But is generative AI more like a wheelchair?",
      content: `Recently I had a discussion with a colleague about the effect and use of AI in software development.  So it got me thinking a little bit.  The thing that I’ve been saying about gen ai is this funny little catch phrase partially inspired by Steve Jobs.  He called the computer the bicycle for the mind.  Meaning that it had an amplifying effect on the users intellect.  A bicycle turns the power of the legs pushing on the pedals into a highly efficient linear motion that carries the rider much father than would be possible walking or running expending the same amount of energy.  I’ve been wondering aloud to some if gen ai is rather than being a bicycle, actually a wheelchair for the mind.
	How is a wheelchair different from a bicycle?  Well they both aid in forward propulsion, and they both are highly efficient at translating a small amount of muscle expenditure into a large amount of linear movement.  But in the case of the bicycle, you are using a part of your body that is meant for transportation, your legs, and amplifying the strength that it has to take you farther.  And in fact using a bicycle actually strengthens your legs, so that you would actually be a better runner or walker even without the bicycle after having trained used one.  A wheelchair is a device that stands in for an ability that is lacking.  If someone is unable to walk because god forbid, their legs don’t function for one reason or another, they can use a wheelchair and it will aid them in moving around and performing some of the same transportationary tasks that the legs normally do.  But the wheelchair doesn’t strengthen the natural means of locomotion the way a bicycle does, that’s the key difference in my mind when I liken gen ai to a wheelchair.  
	Does gen ai make you better at anything?  It can solve some problems for you but it leaves a skills gap wherever it is used.  Did you really gain knowledge by asking it to generate some length of code?  Probably not.  Maybe though.
	And this might be the key part.  Maybe the tool is so strange that I just need to be extremely careful in how I use it and what tasks to use it for.  I need to development some judgement about what the right task is that gen ai can help with, and use it in a way that it is actually strengthening and amplifying my existing skills rather than creating a gap for me that will be difficult or impossible to fill in without the subsequent use of gen ai the next time the issue comes around.
	So what are the rules of thumb or the guideposts one can use to guide their own use of this tool, this new strange and seductive technology?  I wonder if there are leading indicators and trailing indicators of correct use or misuse of gen ai…  Like can you know before hand or do you have to wait until after to know if your use was ok?  Maybe something as simple as sharing what you “learned” with someone else.  Does your use result in a new skill you have, or a new gap or dependency you have?
	Those last couple of questions are pretty good.  Did your use result in a new skill or knew knowledge, or did it create a new knowledge gap or dependency.  Have you outsourced your thinking to someone else.  I heard this concept of outsourcing various aspects of our lives during an interview with a journalist who was investigating the link between dementia and diet.
	He talked about how there were so many gaps in our knowledge in modern society, and the medical knowledge gap is one of the most terrifying.  There’s financial literacy that we outsource to another paid party, nutritional/food preparation that we outsource to another paid party, even in representative democracy we outsource the political decision making to another elected party.  There’s good reasons for that, it allows us to specialize and focus on whatever it is that interests us more, but we need to be careful and watch that this outsourcing doesn’t go too far.  In the case of gen ai (gen ai is out of the bottle) the thing being outsourced could be thinking itself.  You can just prompt it to give you an argument for some position.  So maybe that’s useful for considering things you haven’t thought of before, but is it somehow infringing on a basic capacity of the human mind?  And in so doing actually weakening that capacity?
      `.trim(),
    },
  ];
  