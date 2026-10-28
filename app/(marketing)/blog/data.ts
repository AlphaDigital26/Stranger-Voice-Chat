export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-pitch-your-idea",
    title: "How to Pitch Your Idea to a Stranger in Under 60 Seconds",
    description: "A practical framework for distilling your startup idea into a compelling one-minute pitch that gets real feedback.",
    category: "Pitching",
    readTime: "5 min read",
    date: "August 24, 2026",
    content: `
# The 60-Second Founder Pitch

As an early-stage founder, your most valuable asset isn't your code—it's your ability to clearly explain what you're building. If you can't explain your product to a stranger in 60 seconds, you don't fully understand it yet.

## The Problem-First Framework

Most founders start their pitch with the solution: *"We are building an AI-powered blockchain CRM."* This immediately alienates the listener. Instead, start with the problem.

A great 60-second pitch follows a simple three-part structure:
1. **The Context (15 seconds):** Name the specific person or business experiencing the pain. 
2. **The Problem (20 seconds):** Describe the current, terrible workaround they are using today.
3. **The Solution (25 seconds):** Explain how your product eliminates that specific pain point.

## Example: The Airbnb Pitch

Imagine pitching Airbnb in its earliest days. 
*Context & Problem:* "Right now, if you want to travel to a popular city for a conference, hotels are completely booked out and incredibly expensive. At the same time, locals have empty spare bedrooms sitting unused."
*Solution:* "We built a platform that lets locals rent out their spare rooms to travelers, saving the traveler money and helping the host pay their rent."

## Why Strangers Make the Best Critics

When you pitch to friends, they want to support you. They will nod, smile, and tell you it's a great idea. A stranger on PitchLine owes you nothing. If your 60-second pitch is confusing, they will tell you. 

Use this feedback loop. If the stranger asks a clarifying question, your pitch failed. Rewrite it, jump back in the queue, and try again until the stranger immediately understands the value proposition.
    `
  },
  {
    slug: "give-better-feedback",
    title: "The Art of Giving Honest Feedback Without Being Harsh",
    description: "How to deliver genuinely useful feedback that helps founders iterate — without crushing their enthusiasm.",
    category: "Feedback",
    readTime: "4 min read",
    date: "August 20, 2026",
    content: `
# The Feedback Dilemma

Giving good feedback is hard. When you hear a bad startup idea, your instinct is either to be overly polite and lie ("That sounds interesting!"), or to be brutally blunt ("That will never work."). Neither is helpful to a founder.

Here is how you can deliver highly constructive, honest feedback that a founder will actually appreciate.

## 1. Ask "Why" Before You Judge

Before you poke holes in an idea, make sure you understand the founder's core insight. Ask: *"What made you realize this was a problem worth solving?"* Often, founders have experienced a niche problem you know nothing about. 

## 2. Use the "I wonder..." Framework

Instead of stating your opinion as fact, frame your critiques as curiosities. 
*Bad:* "People won't pay for this."
*Good:* "I wonder if consumers would be willing to pay a monthly subscription for this, given that there are free alternatives. Have you thought about how you'll overcome that?"

This forces the founder to think critically about the problem rather than getting defensive.

## 3. Focus on the Problem, Not Just the Solution

If you don't like the product they are building, ask yourself if the *problem* they are solving is real. If the problem is real, validate that! *"I completely agree that managing personal finances is a nightmare. I'm just not sure if a chat-bot is the way I'd want to solve it. What if it was a background automation instead?"*

By validating the problem, you build rapport, which makes your critique of the solution much easier to digest.
    `
  },
  {
    slug: "idea-validation-mistakes",
    title: "5 Idea Validation Mistakes First-Time Founders Make",
    description: "Confirmation bias, echo chambers, and the other traps that kill products before they're built.",
    category: "Validation",
    readTime: "6 min read",
    date: "August 15, 2026",
    content: `
# The Validation Trap

"Idea validation" is the most misunderstood phase of a startup. Many founders spend weeks validating their idea, only to build a product that nobody wants. Why? Because their validation process was flawed from the start.

Here are the top mistakes first-time founders make when trying to validate an idea.

## Mistake 1: Pitching the Solution, Not Investigating the Problem

When interviewing potential users, founders often say: *"Would you use a product that does X?"* The user, wanting to be polite, says yes. This is a false positive. 
Instead, you should ask about their past behavior: *"Tell me about the last time you tried to solve X. What did you use? How much did it cost?"* If they haven't actively tried to solve the problem recently, your solution won't matter to them.

## Mistake 2: Relying on the "Mom Test" Fails

Asking your friends and family if your idea is good is useless. They have a vested interest in your happiness and will avoid hurting your feelings. You must get out of your echo chamber. This is exactly why we built PitchLine—to give you access to unbiased, objective strangers who don't care about your feelings.

## Mistake 3: Treating Landing Page Signups as Absolute Truth

A landing page with a "Join Waitlist" button is a good start, but an email address is very cheap. 1,000 waitlist signups might translate to 0 paying customers. To truly validate an idea, you need friction. Ask them to pre-pay, or ask them to jump on a 15-minute onboarding call. If they won't do that, the pain isn't acute enough.

## Mistake 4: Fear of Stolen Ideas

Some founders refuse to share their idea because they are afraid someone will steal it. This is the biggest killer of early-stage startups. Execution is everything. By hoarding your idea, you starve it of the feedback it needs to evolve. Talk to everyone about your idea. 
    `
  }
];
