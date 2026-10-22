---
title: "minimal-auto-deployment"
summary: "Dependency-free (standard library only) deployment daemon: polls a git remote on a ticker, fast-forward pulls when the remote moves ahead, runs a deploy script, and installs/uninstalls itself as a systemd service with journald logging."
stack: ["Go", "Linux", "systemd", "Git"]
repo: https://github.com/RakinRkz/minimal-auto-deployment
caseStudy: true
order: 3
---

## Problem

I wanted a small server to redeploy itself whenever new commits landed on a branch, without standing
up a CI/CD system for it. No webhook receiver, no runner, no pipeline YAML. Just: notice there is
something new, pull it, run the deploy script.

That is a tooling problem, not a distributed-systems one. The interesting part is how little you
can build while still getting something you would trust to run unattended.

## Constraints

- **One binary, no dependencies.** The tool uses only Go's standard library (no `require` lines in
  `go.mod`), so it copies onto a fresh Linux box and runs.
- **No inbound traffic.** The server should not need an open port or a public URL for a webhook, so it
  has to pull rather than be pushed to.
- **Managed by the OS.** It should start on boot, restart if it dies, and log somewhere standard,
  without me writing a supervisor.
- **Configurable without flags.** A short `.env` file, plus an interactive `init` so nobody has to
  remember key names.

## Design

The whole tool is about 430 lines of Go across four files.

**The loop.** `daemon` starts a `time.Ticker` (default every 60 seconds). On each tick it runs
`git fetch` against the configured remote, then compares `git rev-parse` of the local branch with the
remote-tracking branch. If the hashes differ, it runs `git pull --ff-only` and then executes the
deploy script with bash, inside the repository directory.

**Fast-forward only.** The server never creates merge commits. If history has diverged, the pull
fails loudly instead of inventing a merge nobody reviewed.

**Configuration.** A `.env` file holds five keys: `GIT_DIR`, `SCRIPT_PATH`, `POLL_INTERVAL`,
`GIT_REMOTE` and `GIT_BRANCH`. The remote defaults to `origin`, the branch to `main` and the interval
to 60. `init` prompts for each value and checks that the directory is a git repository and the script
exists before writing the file. `config get` and `config set` edit it afterwards.

**systemd integration.** `install-service` writes a unit to `/etc/systemd/system/`, then reloads,
enables and starts it. The unit uses `Restart=always` with a 10-second back-off and sends stdout and
stderr to the journal, so `journalctl -u minimal-deploy` is the log viewer. `uninstall-service`
stops, disables and removes it.

## Trade-offs

- **Polling instead of webhooks.** It works behind NAT and needs no public endpoint. The cost is
  latency: a commit can wait up to one interval before it deploys.
- **A sequential loop.** One check runs at a time, and Go's ticker drops ticks while the loop is busy,
  so two deploys can never overlap. The cost is that one slow step delays everything after it.
- **The OS as supervisor.** Restarts and logging come from systemd for free. The cost is that the tool
  is Linux-and-systemd only.
- **Standard library only.** Nothing to vendor or audit. The cost is hand-rolled pieces, such as a
  small `.env` parser, that a library would have handled more thoroughly.

## What I'd change

The current version is honest about being minimal. Reading it again with production in mind, these
are the gaps, roughly in the order I would fix them:

1. **Timeouts on every command.** Each `git` and script call uses `exec.Command` with no deadline. A
   fetch stuck on an auth prompt or a stalled network blocks the loop forever. I'd switch to
   `exec.CommandContext` with a per-step timeout.
2. **Graceful shutdown.** There is no signal handling, so SIGTERM kills the process, and a deploy that
   is halfway through dies with it. Handling it takes two halves. In Go, `signal.NotifyContext` lets the
   daemon hear SIGTERM and either finish or cancel the current deploy cleanly. In the unit,
   `KillMode=mixed` with a `TimeoutStopSec` lets systemd signal only the daemon first, instead of every
   process in its group (git and the script included), and gives the deploy time to wrap up.
3. **Retry failed deploys.** The pull moves the branch *before* the script runs. If the script fails,
   the next tick sees matching hashes and never tries again. I'd record the last successfully deployed
   commit and treat "deployed ≠ HEAD" as work still to do.
4. **Retries with back-off for git.** Today a failed fetch just waits for the next tick. Short
   retries with exponential back-off would ride out brief network blips.
5. **Ancestry checks, not hash equality.** If the local branch is ahead of the remote, the hashes
   always differ, the pull reports "already up to date", and the script runs again on every tick.
   `git merge-base --is-ancestor` would tell "behind" apart from "ahead" and "diverged".
6. **Least privilege and boot ordering.** The unit has no `User=`, so the daemon and the deploy script
   run as root, and it waits for `network.target` rather than `network-online.target`. I'd give it a
   dedicated user and the right target.
7. **Structured logs and tests.** Plain `log.Printf` lines become `log/slog` with fields for commit,
   step and duration. And the tool has no tests yet. The loop's decisions are easy to test once git
   calls sit behind a small interface.

The first two changes look roughly like this, a sketch rather than the current code:

```go
ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, os.Interrupt)
defer stop()

run := func(timeout time.Duration, name string, args ...string) error {
	stepCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	cmd := exec.CommandContext(stepCtx, name, args...)
	cmd.Dir = cfg.GitDir
	return cmd.Run()
}
```

None of this makes the tool bigger in spirit. It is still one small binary that pulls and deploys.
It just fails in ways you can see and recover from.
