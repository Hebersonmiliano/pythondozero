"use client";
import {useState} from "react";
type Runtime={runPythonAsync:(code:string)=>Promise<unknown>;setStdout:(o:{batched:(text:string)=>void})=>void;setStderr:(o:{batched:(text:string)=>void})=>void};
type Props={code:string;exampleCode:string;onCodeChange:(value:string)=>void;codeSaved:boolean;expectedCommands?:string[];onResult?:(ok:boolean,message:string)=>void};
declare global{interface Window{loadPyodide?:(options:{indexURL:string})=>Promise<Runtime>;pythonRuntime?:Runtime}}
export default function CodeRunner({code,exampleCode,onCodeChange,codeSaved,expectedCommands=[],onResult}:Props){
 const [output,setOutput]=useState("Clique em Executar para testar."),[running,setRunning]=useState(false),[analysis,setAnalysis]=useState("");
 async function run(){
  setRunning(true);setOutput("Carregando Python...");setAnalysis("");
  try{
   if(!window.loadPyodide){// @ts-expect-error módulo externo do navegador
    const module=await import(/* webpackIgnore: true */"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs");window.loadPyodide=module.loadPyodide}
   const runtime=window.pythonRuntime||await window.loadPyodide!({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"});window.pythonRuntime=runtime;
   const lines:string[]=[];runtime.setStdout({batched:text=>lines.push(text)});runtime.setStderr({batched:text=>lines.push(text)});
   const prelude=`import builtins\nfrom js import window\n\ndef _entrada(mensagem=''):\n    resposta = window.prompt(str(mensagem))\n    if resposta is None:\n        raise EOFError('Entrada cancelada pelo usuário')\n    return str(resposta)\n\nbuiltins.input = _entrada\n`;
   const result=await runtime.runPythonAsync(prelude+code),resultText=result!==undefined&&result!==null?String(result):"";
   const visible=lines.join("\n")+resultText||"Programa executado sem saída.";setOutput(visible);
   const normalized=code.toLowerCase(),ignored=["aspas","indice","lista","parametro","argumento","indentacao","comentario"];const missing=expectedCommands.map(x=>x.replace(/[().#]/g,"").trim().toLowerCase()).filter(x=>/^[a-z_]+$/.test(x)&&x.length>1&&!ignored.includes(x)&&!normalized.includes(x)).slice(0,2);
   const msg=missing.length?`O código executou, mas revise se precisa usar: ${missing.join(", ")}.`:"Código executado sem erros. Confira se a saída atende ao enunciado.";
   setAnalysis(msg);onResult?.(missing.length===0,msg);
  }catch(error){const detail=error instanceof Error?error.message:String(error);if(detail.includes("Entrada cancelada pelo usuário")){const msg="A entrada de dados foi cancelada. Execute novamente e responda às perguntas exibidas pelo programa.";setOutput("Execução cancelada.");setAnalysis(msg);onResult?.(false,msg)}else{const msg="O Python encontrou um erro: "+detail;setOutput(msg);setAnalysis("Leia a última linha do erro, corrija o código e execute novamente.");onResult?.(false,msg)}}
  finally{setRunning(false)}
 }
 return <div className="code-lab"><div className="code-lab-head"><div><span className="section-kicker">LABORATÓRIO PYTHON</span><h3>Execute e verifique seu código</h3></div><button onClick={()=>onCodeChange(exampleCode)}>Restaurar exemplo</button></div><textarea value={code} onChange={e=>onCodeChange(e.target.value)} spellCheck={false} aria-label="Editor de código Python"/><div className="answer-status"><span>{code.length} caracteres</span><span aria-live="polite">{codeSaved?"✓ Código salvo":"Rascunho de código"}</span></div><button className="run-code" onClick={run} disabled={running}>{running?"Executando...":"▶ Executar e verificar"}</button><div className="code-output"><b>SAÍDA</b><pre>{output}</pre></div>{analysis&&<p className="code-analysis" role="status">{analysis}</p>}<small>Quando seu código usar input(), responda às perguntas que aparecerem na tela. O teste também verifica erros de execução e comandos essenciais.</small></div>
}
