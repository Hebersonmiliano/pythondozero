import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const courseData = await readFile(
  new URL("../app/course-data.ts", import.meta.url),
  "utf8",
);
const commandData = await readFile(
  new URL("../app/command-data.ts", import.meta.url),
  "utf8",
);
const codeRunner = await readFile(
  new URL("../app/code-runner.tsx", import.meta.url),
  "utf8",
);

test("lesson 4 requests name, phone and school as text", () => {
  const lesson = courseData.match(/\{slug:"input"[^\n]+\}/)?.[0] ?? "";

  assert.match(lesson, /input\(\"Qual seu nome\? \"\)/);
  assert.match(lesson, /input\(\"Seu telefone\? \"\)/);
  assert.match(lesson, /input\(\"Nome da sua escola\? \"\)/);
  assert.doesNotMatch(lesson, /int\(input|float\(input/);
});

test("lesson 4 verification only expects commands used by its example", () => {
  const commands = commandData.match(/"input":\[[\s\S]*?\n \],/)?.[0] ?? "";

  assert.match(commands, /command:"input\(\)"/);
  assert.match(commands, /command:"print\(\)"/);
  assert.doesNotMatch(commands, /command:"int\(\)"|command:"float\(\)"/);
});

test("the runner explains missing input values without showing a Python traceback", () => {
  assert.match(codeRunner, /requiredInputs>1&&filledValues\.length<requiredInputs/);
  assert.match(codeRunner, /Preencha \$\{requiredInputs\} respostas/);
  assert.match(codeRunner, /detail\.includes\("Faltou informar um valor no campo Entradas"\)/);
  assert.match(codeRunner, /Execução não concluída\./);
});
