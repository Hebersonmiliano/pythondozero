"use client";
import {useState} from "react";

type Props={initialCode:string;onCodeChange:(value:string)=>void};
declare global{interface Window{loadPyodide?:(options:{indexURL:string})=>Promise<{runPythonAsync:(code:string)=>Promise<unknown>;setStdout:(o:{batched:(text:string)=>void})=>void;setStderr:(o:{batched:(text:string)=>void})=>void}>;pythonRuntime?:unknown}}

export default function CodeRunner({initialCode,onCodeChange}:Props){
 const [code,setCode]=useState(initialCode),[output,setOutput]=useState("Clique em Executar para testar."),[running,setRunning]=useState(false);
 async function run(){
  setRunning(true);setOutput("Carregando Python...");
  try{
   if(!window.loadPyodide){// @ts-expect-error Módulo externo carregado diretamente no navegador\n   const module=await import(/* webpackIgnore: true */"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs");window.loadPyodide=module.loadPyodide}
   const runtime=(window.pythonRuntime||await window.loadPyodide!({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"})) as Awaited<ReturnType<NonNullable<typeof window.loadPyodide>>>;window.pythonRuntime=runtime;
   const lines:string[]=[];runtime.setStdout({batched:text=>lines.push(text)});runtime.setStderr({batched:text=>lines.push(text)});
   const result=await runtime.runPythonAsync(code);setOutput(lines.join("\n")+(result!==undefined&&result!==null?String(result):"")||"Programa executado sem saída.");
  }catch(error){setOutput("Erro: "+(error instanceof Error?error.message:String(error)))}
  finally{setRunning(false)}
 }
 function update(value:string){setCode(value);onCodeChange(value)}
 return <div className="code-lab"><div className="code-lab-head"><div><span className="section-kicker">LABORATÓRIO PYTHON</span><h3>Teste seu código aqui</h3></div><button onClick={()=>update(initialCode)}>Restaurar exemplo</button></div><textarea value={code} onChange={e=>update(e.target.value)} spellCheck={false} aria-label="Editor de código Python"/><button className="run-code" onClick={run} disabled={running}>{running?"Executando...":"▶ Executar código"}</button><div className="code-output"><b>SAÍDA</b><pre>{output}</pre></div><small>O Python é carregado no seu navegador na primeira execução. Programas com input() ainda não são aceitos neste laboratório.</small></div>
}