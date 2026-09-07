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
