import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const lessonPage = await readFile(
  new URL("../app/aulas/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const progressRoute = await readFile(
  new URL("../app/api/progress/route.ts", import.meta.url),
  "utf8",
);

test("keeps the written answer and code draft in independent React state", () => {
  assert.match(lessonPage, /\[answer,setAnswer\]=useState\(""\)/);
  assert.match(lessonPage, /\[codeDraft,setCodeDraft\]=useState/);
  assert.match(lessonPage, /onCodeChange=\{writeCodeDraft\}/);
  assert.doesNotMatch(lessonPage, /onCodeChange=\{writeAnswer\}/);
});

test("saves code drafts separately for each student and lesson", () => {
  assert.match(
    lessonPage,
    /studentId:student\.id,lessonSlug:lesson\.slug[^}]+codeDraft:value/,
  );
  assert.match(progressRoute, /code_draft AS "codeDraft"/);
  assert.match(
    progressRoute,
    /answer=CASE WHEN \$\{hasAnswer\} THEN excluded\.answer ELSE progress\.answer END/,
  );
  assert.match(
    progressRoute,
    /code_draft=CASE WHEN \$\{hasCodeDraft\} THEN excluded\.code_draft ELSE progress\.code_draft END/,
  );
});
