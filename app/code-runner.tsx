"use client";
import {useState} from "react";
type Runtime={runPythonAsync:(code:string)=>Promise<unknown>;setStdout:(o:{batched:(text:string)=>void})=>void;setStderr:(o:{batched:(text:string)=>void})=>void};
type Props={code:string;exampleCode:string;onCodeChange:(value:string)=>void;codeSaved:boolean;expectedCommands?:string[];onResult?:(ok:boolean,message:string)=>void};
declare global{interface Window{loadPyodide?:(options:{indexURL:string})=>Promise<Runtime>;pythonRuntime?:Runtime}}
export default function CodeRunner({code,exampleCode,onCodeChange,codeSaved,expectedCommands=[],onResult}:Props){
 const [output,setOutput]=useState("Clique em Executar para testar."),[running,setRunning]=useState(false),[analysis,setAnalysis]=useState("");
 async function run(){
  setRunning(true);setOutput("Executando programa...");setAnalysis("");
  try{
   if(!window.loadPyodide){// @ts-expect-error módulo externo do navegador
    const module=await import(/* webpackIgnore: true */"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs");window.loadPyodide=module.loadPyodide}
   const runtime=window.pythonRuntime||await window.loadPyodide!({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"});window.pythonRuntime=runtime;
   const lines:string[]=[];runtime.setStdout({batched:text=>lines.push(text)});runtime.setStderr({batched:text=>lines.push(text)});
   const prelude=`import builtins\nfrom js import window\n\ndef _entrada(mensagem=''):\n    pergunta = str(mensagem) if mensagem else 'Digite um valor:'\n    resposta = window.prompt(pergunta, '')\n    if resposta is None:\n        raise EOFError('Entrada cancelada pelo aluno')\n    return str(resposta)\n\nbuiltins.input = _entrada\n`;
   const result=await runtime.runPythonAsync(prelude+code),resultText=result!==undefined&&result!==null?String(result):"";
   const visible=(lines.length?lines.join("\n")+(resultText?"\n":""):"")+resultText||"Programa executado sem saída.";setOutput(visible);
   const normalized=code.toLowerCase(),ignored=["aspas","indice","lista","parametro","argumento","indentacao","comentario"];const missing=expectedCommands.map(x=>x.replace(/[().#]/g,"").trim().toLowerCase()).filter(x=>/^[a-z_]+$/.test(x)&&x.length>1&&!ignored.includes(x)&&!normalized.includes(x)).slice(0,2);
   const msg=missing.length?`O código executou, mas revise se precisa usar: ${missing.join(", ")}.`:"Código executado sem erros. Confira o resultado na área SAÍDA.";
   setAnalysis(msg);onResult?.(missing.length===0,msg);
  }catch(error){const detail=error instanceof Error?error.message:String(error);if(detail.includes("Entrada cancelada pelo aluno")){const msg="Você cancelou uma pergunta do input(). Clique em Executar novamente e responda para o programa continuar.";setOutput("Execução interrompida pelo aluno.");setAnalysis(msg);onResult?.(false,msg)}else{const msg="O Python encontrou um erro: "+detail;setOutput(msg);setAnalysis("Leia a última linha do erro, corrija o código e execute novamente.");onResult?.(false,msg)}}
  finally{setRunning(false)}
 }
 return <div className="code-lab"><div className="code-lab-head"><div><span className="section-kicker">LABORATÓRIO PYTHON</span><h3>Execute e verifique seu código</h3></div><button onClick={()=>onCodeChange(exampleCode)}>Restaurar exemplo</button></div><textarea value={code} onChange={e=>onCodeChange(e.target.value)} spellCheck={false} aria-label="Editor de código Python"/><div className="answer-status"><span>{code.length} caracteres</span><span aria-live="polite">{codeSaved?"✓ Código salvo":"Rascunho de código"}</span></div><button className="run-code" onClick={run} disabled={running}>{running?"Executando...":"▶ Executar"}</button><div className="code-output"><b>SAÍDA</b><pre>{output}</pre></div>{analysis&&<p className="code-analysis" role="status">{analysis}</p>}<small>Se o programa usar input(), a pergunta aparecerá durante a execução. Digite sua resposta e confirme para o Python continuar.</small></div>
}
