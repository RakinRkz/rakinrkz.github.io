---
title: "The worst bug I've fixed: a report that never finished"
description: "A production report timed out after 20 minutes and everyone blamed the database. The database was idle."
pubDate: 2026-10-22
draft: false
---

<aside class="summary">
<p><strong>In short:</strong> a production report that never finished in 20 minutes now runs in about
15 seconds. Everyone assumed slow SQL, but the database was idle. The time was going into an O(n²) loop in
our C# code. I ran the investigation by directing a coding agent, and <a href="#how-the-work-was-split">how
the work was split</a> is at the end.</p>
</aside>

<ol class="flow" aria-label="The investigation, step by step">
<li><span>Assumption</span>“The SQL is slow”</li>
<li><span>Check</span>Ask the database what it is doing right now</li>
<li><span>Finding</span>No active query: the database is idle</li>
<li><span>Narrowing</span>A quadratic loop in the C# aggregation</li>
<li><span>Fix</span>Let the database do the aggregating</li>
<li><span>Proof</span>Output must match the original, then measure</li>
</ol>

## The symptom

A production report in a multi-tenant hospitality POS/ERP SaaS stopped finishing. Not slow: it never
completed, even after twenty minutes, and the request timed out. It had been reported before and
written off as "the database is slow".

It only failed in one shape: the full date range with one particular exclusion filter applied. Other
shapes of the same report finished, which made it easy to dismiss.

## Testing the obvious assumption

The obvious theory was bad SQL: a missing index, a query plan gone wrong. It is the right first guess
for a slow report, and that is the problem with it. It is so plausible that nobody checks it.

So the first step was to check it before acting on it. SQL Server reports what it is doing right now
through its dynamic management views. While the report was running, we queried
`sys.dm_exec_requests` to see what the database was actually working on.

<aside class="callout">
<p>The database wasn't slow. It was idle.</p>
</aside>

There was **no active query running**. SQL Server had finished its part, and the report was still
going. Whatever was eating the time was in our own C# application code, after the data had already
been read.

That one observation flipped the investigation. Any time spent tuning SQL would have been wasted.

## Narrowing it down

With the database ruled out, the search moved to the application code between "the rows arrive" and
"the report renders". The aggregation step stood out. For each entity in the report, it found that
entity's related rows by scanning entire in-memory collections, three large ones and a fourth somewhat
smaller, instead of asking for them by key.

Each scan is linear, and that is the trap. One scan is fast, so the code reads as harmless. But it ran
once per entity. Tens of thousands of entities, each scanning collections of hundreds of thousands of
rows, multiplies out to **tens of billions of element visits**. That is an O(n²) loop. It only became
fatal at the full date range with the exclusion applied, which is exactly the case the ticket was
about.

Simplified, the shape was this (an illustration, not the production code):

```csharp
// Before: for every entity, scan every related collection again.
// That is O(entities × rows).
foreach (var entity in entities)
{
    var a = rowsA.Where(r => r.EntityId == entity.Id);
    var b = rowsB.Where(r => r.EntityId == entity.Id);
    var c = rowsC.Where(r => r.EntityId == entity.Id);
    var d = rowsD.Where(r => r.EntityId == entity.Id);
    results.Add(Summarise(entity, a, b, c, d));
}
```

Nothing in that loop looks wrong in isolation, which is why it reads fine in code review. The cost is
only visible when you multiply the sizes.

## The fix: let the database aggregate

The rewrite stopped doing the database's job in memory. Instead of loading rows and rescanning them for
every entity in C#, the query path asks the database for the grouped result in a single set-based
query. The application gets back one row of totals per entity and never loops over the raw rows at
all.

Again simplified, the shape after the rewrite:

```csharp
// After: one set-based query. The database groups and sums,
// and the app gets back one row of totals per entity.
var totals = await db.Rows
    .Where(r => r.Date >= from && r.Date < to)
    .GroupBy(r => r.EntityId)
    .Select(g => new { EntityId = g.Key, Total = g.Sum(r => r.Amount) })
    .ToListAsync();
```

The work now grows with the rows the database has to read, not with entities × rows, and grouping is
exactly what a database is built to do. Two versions of the rewrite were built and measured, one in
Entity Framework and one in raw SQL.

## Correctness first, then speed

A fast report that is subtly wrong is worse than a slow one, because nobody notices it is wrong. So a
rewrite only counted if it reproduced the original's output exactly. That comparison was possible on
the case the original could finish: the full range without the exclusion. Only versions that matched
were timed.

| Case | Before | After |
|---|---|---|
| The ticket: full range with the exclusion | never finished (timed out after 20 minutes) | **about 15 seconds** |
| The same report without the exclusion | finished, slowly | **up to ~10× faster** |

## How the work was split

I ran this investigation by directing a coding agent end to end. The judgment was mine, and the
execution was the agent's:

| I decided | The agent did |
|---|---|
| What to investigate, and the hypothesis to test first: is the time going into SQL or into our code? | Ran the DMV analysis while the report was running |
| What a rewrite had to match to count as correct, and which parameters to optimise | Rewrote the query path, in Entity Framework and in raw SQL |
| Whether to trust the results: checking the output was correct and sanity-checking the numbers | Ran the timing runs and produced the comparison |

## What I took from it

**Find where the time goes before forming a theory about why.** One query turned "the database is
slow" into "the database is doing nothing", and that pointed straight at the real culprit. Now, when
something is slow, the first thing I establish is where the time is actually being spent.

**Plausible theories are the dangerous ones.** This bug survived because the obvious explanation was
never tested. Once someone looked in the right place it was not hard to find. The hard part was
deciding to look somewhere other than where everyone already assumed.

**Directing an agent is still engineering.** The agent typed the queries and ran the timings. The
value was in choosing what to prove, setting a correctness bar before looking at any speed numbers,
and refusing to trust a result that had not been checked.
