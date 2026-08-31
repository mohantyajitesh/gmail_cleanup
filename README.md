# Gmail Cleanup

**Automatically clear old Promotions and Social emails from Gmail. Free, runs inside your own Google account, nothing is ever deleted — only moved to Trash.**

## The gap this fills

Gmail can unsubscribe you from newsletters. Gmail filters can delete an email the moment it arrives. But there is no built-in way to say *"remove anything in Promotions older than 30 days."* Filters have no age condition. So the Promotions and Social tabs quietly pile up — thousands of sale alerts and notifications you'll never open again, eating into the 15 GB you share with Drive and Photos.

This is a 40-line script that closes that gap. Twice a day it moves matching mail to Trash. Gmail empties Trash on its own after 30 days, so anything it touches stays recoverable for a month.

## What it does — and never does

- Moves **Promotions** and **Social** emails **older than 30 days** to Trash (both are adjustable).
- **Never** touches starred or important mail. Order confirmations, shipping notices and itineraries that Gmail files under Promotions are usually marked important, so they stay.
- **Never** permanently deletes anything. Trash is the only place it can send mail.
- Costs nothing and uses no AI at runtime — it's a plain Google Apps Script running on Google's servers in your account.

## Setup in 6 steps

**1. Create the script.** Go to [script.new](https://script.new). Click "Untitled project" and name it `Gmail Cleanup`. Delete the placeholder code, paste in [`gmail_cleanup.gs`](gmail_cleanup.gs), and save.

**2. Add the Gmail service.** In the left sidebar, click the **+** next to *Services*, choose **Gmail API**, and click *Add*.

**3. Set your time zone.** Click the gear icon (*Project Settings*) and pick your time zone. This is what makes the schedule fire at the right local time.

**4. Run a preview and authorize.** In the toolbar, select `preview` from the function dropdown and click **Run**. Google will show an "unverified app" warning — that's normal for a personal script you wrote yourself. Click *Advanced* → *Go to Gmail Cleanup* → *Allow*. Then open the Execution log and check the sample looks like mail you're happy to lose.

**5. Schedule it.** Click the clock icon (*Triggers*) → *Add Trigger*. Set function `cleanup`, event source *Time-driven*, type *Day timer*, and the hour you want (e.g. 8am–9am). Turn on failure notifications. Save, then add a second trigger for the evening (e.g. 8pm–9pm).

**6. Done.** The first few runs work through your backlog on their own — you'll see Trash filling up over a day or two. If a run ever fails, Google emails you.

## Changing or stopping it

All settings live in one block at the top of the script:

```javascript
const CONFIG = {
  categories: ['social', 'promotions'],
  olderThanDays: 30,
  excludeStarred: true,
  excludeImportant: true,
  maxPerRun: 10000,
};
```

Edit, save, and the next run uses the new values. To stop it, delete the two triggers.

## Prefer to be walked through it?

[`gem-instructions.md`](gem-instructions.md) contains instructions for a Gemini Gem that asks you a few questions, fills in the config for you, and guides you through the six steps one at a time. Paste it into a new Gem's *Instructions* field.

## Honest notes

- **Storage.** How much space you get back depends on where your bloat lives. Promotions mail is small; if your 15 GB is full of Drive files or Photos, this won't fix that. What it will do is stop the pile-up permanently.
- **Read the script.** It's 40 lines. The only write operation is `batchModify` adding the `TRASH` label. If you're pasting code into your Google account, you should be able to see that for yourself.
- **The "unverified app" screen.** Google shows it for any script that isn't a published, reviewed app — including one you wrote for yourself. It's not a judgment on the code.

## License

MIT — do what you like with it.
