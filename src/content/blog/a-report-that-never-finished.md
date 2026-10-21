---
title: "The worst bug I've fixed: a report that never finished"
description: "A production report timed out after 20 minutes and everyone blamed the database. The database was idle."
pubDate: 2026-10-22
draft: false
---

## The symptom

A production report in a multi-tenant hospitality POS/ERP SaaS stopped finishing. Not slow: it never
completed, even after twenty minutes, and the request timed out. It had been reported before and
quietly written off. Reports are heavy, the database is slow, try a smaller date range.

It only failed in one shape: the full date range with one particular exclusion filter applied.
Smaller ranges came back fine. That is exactly why it had survived so long. Every quick test anyone
tried was a case that worked.

## Testing the obvious assumption

The obvious theory was bad SQL: a missing index, a query plan gone wrong. It is the right first guess
for a slow report, and that is the problem with it. It is so plausible that nobody checks it.

So I checked it before acting on it. SQL Server exposes what it is doing right now through its
dynamic management views, so while the report was running I queried `sys.dm_exec_requests` to see
what the database was actually working on.

The answer was: nothing. The DMVs showed hundreds of seconds of CPU burned with **no active query
running**. The database was not slow. It was idle. Whatever was eating the time was in our own C#
application code, after the data had already been read.

That one observation flipped the investigation. Any time spent tuning SQL would have been wasted.

## Narrowing it down

With the database ruled out, the search space became the application code between "the rows arrive"
and "the report renders". The aggregation step stood out. For each entity in the report, it found
that entity's related rows by scanning entire in-memory collections, three large ones and a fourth
somewhat smaller, instead of looking them up by key.

Each scan is linear, and that is the trap. One scan is fast, so the code reads as harmless. But it
ran once per entity. Tens of thousands of entities, each scanning collections of hundreds of
thousands of rows, multiplies out to **tens of billions of element visits**. That is an O(n²) loop,
and at full date range with the exclusion applied, n was finally big enough to be fatal.

Simplified, the shape was this (an illustration, not the production code):

```csharp
// For every entity, scan every related collection again: O(entities × rows).
foreach (var entity in entities)
{
    var a = rowsA.Where(r => r.EntityId == entity.Id);
    var b = rowsB.Where(r => r.EntityId == entity.Id);
    var c = rowsC.Where(r => r.EntityId == entity.Id);
    var d = rowsD.Where(r => r.EntityId == entity.Id);
    results.Add(Summarise(entity, a, b, c, d));
}
```

Nothing in that loop looks wrong in isolation, which is why it reads fine in code review. The cost
is only visible when you multiply the sizes.

## The fix, measured

I rewrote the query path so the aggregation no longer rescans those collections for every entity.
Rather than guess which approach would be fastest, I built two versions, one in Entity Framework and
one in raw SQL, and measured both against the original.

Before comparing speed, I set a correctness bar: a rewrite only counted if it reproduced the
original report's output exactly. A fast report that is subtly wrong is worse than a slow one,
because nobody notices it is wrong. Only versions that matched were timed.

The results:

- The case from the ticket, full range with the exclusion, went from **never finishing in 20
  minutes to about 15 seconds**.
- Related queries over the same data got **up to ~10× faster**.

## What I took from it

**Find where the time goes before forming a theory about why.** The DMV query was the whole
investigation. One query turned "the database is slow" into "the database is doing nothing", and
that pointed straight at the real culprit. Now, when something is slow, the first thing I establish
is where the time is actually being spent.

**Plausible theories are the dangerous ones.** This bug survived because the obvious explanation
was never tested. It was not hard to find once someone looked in the right place. The hard part was
deciding to look somewhere other than where everyone already assumed.

**Correctness first, then speed.** Requiring the rewrite to match the original output exactly made
the speed numbers worth trusting. Without that bar, "10× faster" is only a claim.

**How the work was done.** I ran this investigation by directing a coding agent end to end. I set
the hypothesis and the diagnostic strategy, defined what a rewrite had to match to count as correct,
and verified the results before trusting them. The agent did the execution and the timing runs. The
judgment, meaning what to prove, how to prove it and whether to believe the answer, was the part that
mattered.
