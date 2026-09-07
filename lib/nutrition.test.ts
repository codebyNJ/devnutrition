/* node --test (needs no framework): the label is a joke, but a joke that
 * changes its numbers on every reload stops being funny. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "./nutrition.ts";

const torvalds = { login: "torvalds", public_repos: 12, followers: 321303, created_at: "2011-09-03T15:26:22Z" };

test("same handle always yields the same label", () => {
  assert.deepEqual(analyze("shadcn", null), analyze("shadcn", null));
});

test("different handles yield different labels", () => {
  assert.notDeepEqual(analyze("torvalds", null), analyze("karpathy", null));
});

test("real profile data reaches the panel", () => {
  const d = analyze("torvalds", torvalds);
  assert.equal(d.real, true);
  assert.equal(d.repos, 12);
  assert.ok(Number(d.years) > 13, `account age looks wrong: ${d.years}`);
});

test("a rate-limited scan still produces a full label", () => {
  const d = analyze("torvalds", null);
  assert.equal(d.real, false);
  assert.ok(d.servings > 0 && d.calories > 0);
});

/* The grade once came out of the invented metrics, which handed an F to
 * people whose whole public record is open source. Lock the fix in. */
test("prolific open-source developers grade well", () => {
  const people = {
    torvalds: { public_repos: 12, followers: 321303, created_at: "2011-09-03T15:26:22Z" },
    karpathy: { public_repos: 30, followers: 110000, created_at: "2011-04-01T00:00:00Z" },
    sindresorhus: { public_repos: 1100, followers: 62000, created_at: "2011-01-01T00:00:00Z" },
    shadcn: { public_repos: 60, followers: 40000, created_at: "2013-06-01T00:00:00Z" },
  };
  for (const [login, u] of Object.entries(people)) {
    const { grade } = analyze(login, u);
    assert.ok(["A+", "A"].includes(grade), `${login} graded ${grade}, expected A or A+`);
  }
});

test("reach cannot be faked by pushing empty repositories", () => {
  const spammer = analyze("repo-spammer", {
    public_repos: 5000, followers: 3, created_at: "2024-01-01T00:00:00Z",
  });
  assert.ok(["C", "D", "F"].includes(spammer.grade), `graded ${spammer.grade}`);
});

test("a brand-new account is not graded like a veteran", () => {
  const fresh = analyze("brand-new-dev", {
    public_repos: 5, followers: 12, created_at: "2024-01-01T00:00:00Z",
  });
  assert.ok(["D", "F"].includes(fresh.grade), `graded ${fresh.grade}`);
});

test("every value stays inside its printed range", () => {
  for (const h of ["torvalds", "karpathy", "sindresorhus", "shadcn", "a", "zzzzzzzzzz"]) {
    for (const u of [null, torvalds]) {
      const d = analyze(h, u);
      assert.ok(d.aura >= 0 && d.aura <= 99, `aura ${d.aura}`);
      assert.ok(d.docs >= 0 && d.docs <= 4, `docs ${d.docs}`);
      assert.ok(d.stackOverflow >= 22 && d.stackOverflow <= 88, `so ${d.stackOverflow}`);
      assert.ok(d.debt >= 620, `debt ${d.debt}`);
      assert.ok(Number.isFinite(d.servings) && d.servings > 0, `servings ${d.servings}`);
    }
  }
});
