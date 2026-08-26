"use client";
import {useState} from "react";
type Runtime={runPythonAsync:(code:string)=>Promise<unknown>;setStdout:(o:{batched:(text:string)=>void})=>void;setStderr:(o:{batched:(text:string)=>void})=>void};
type Props={initialCode:string;onCodeChange:(value:string)=>void;expectedCommands?:string[];onResult?:(ok:boolean,message:string)=>void};
declare global{interface Window{loadPyodide?:(options:{indexURL:string})=>Promise<Runtime>;pythonRuntime?:Runtime}}
export default function CodeRunner({initialCode,onCodeChange,expectedCommands=[],onResult}:Props){
 const [code,setCode]=useState(initialCode),[inputs,setInputs]=useState(""),[output,setOutput]=useState("Clique em Executar para testar."),[running,setRunning]=useState(false),[analysis,setAnalysis]=useState("");
 async function run(){
  setRunning(true);setOutput("Carregando Python...");setAnalysis("");
  try{
   if(!window.loadPyodide){// @ts-expect-error módulo externo do navegador
    const module=await import(/* webpackIgnore: true */"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs");window.loadPyodide=module.loadPyodide}
   const runtime=window.pythonRuntime||await window.loadPyodide!({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"});window.pythonRuntime=runtime;
   const lines:string[]=[];runtime.setStdout({batched:text=>lines.push(text)});runtime.setStderr({batched:text=>lines.push(text)});
   const values=inputs.split(/\r?\n/);const prelude=`import builtins
_dados = iter(${JSON.stringify(values)})
def _entrada(mensagem=''):
    if mensagem:
        print(mensagem, end='')
    try:
        return next(_dados)
    except StopIteration:
        raise EOFError('Faltou informar um valor no campo Entradas')
builtins.input = _entrada
`;
   const result=await runtime.runPythonAsync(prelude+code),resultText=result!==undefined&&result!==null?String(result):"";
   const visible=lines.join("\n")+resultText||"Programa executado sem saída.";setOutput(visible);
   const normalized=code.toLowerCase(),missing=expectedCommands.map(x=>x.replace(/[().]/g,"").trim().toLowerCase()).filter(x=>x.length>1&&!normalized.includes(x)).slice(0,2);
   const msg=missing.length?`O código executou, mas revise se precisa usar: ${missing.join(", ")}.`:"Código executado sem erros. Confira se a saída atende ao enunciado.";
   setAnalysis(msg);onResult?.(missing.length===0,msg);
  }catch(error){const msg="O Python encontrou um erro: "+(error instanceof Error?error.message:String(error));setOutput(msg);setAnalysis("Leia a última linha do erro, corrija o código e execute novamente.");onResult?.(false,msg)}
  finally{setRunning(false)}
 }
 function update(value:string){setCode(value);onCodeChange(value)}
 return <div className="code-lab"><div className="code-lab-head"><div><span className="section-kicker">LABORATÓRIO PYTHON</span><h3>Execute e verifique seu código</h3></div><button onClick={()=>update(initialCode)}>Restaurar exemplo</button></div><textarea value={code} onChange={e=>update(e.target.value)} spellCheck={false} aria-label="Editor de código Python"/><label className="program-inputs">Entradas para input() <small>Uma resposta por linha, na ordem em que o programa pedir.</small><textarea value={inputs} onChange={e=>setInputs(e.target.value)} placeholder={"Exemplo:\nMariana\n16"}/></label><button className="run-code" onClick={run} disabled={running}>{running?"Executando...":"▶ Executar e verificar"}</button><div className="code-output"><b>SAÍDA</b><pre>{output}</pre></div>{analysis&&<p className="code-analysis" role="status">{analysis}</p>}<small>O teste verifica erros de execução e os comandos essenciais. Compare também a saída com o enunciado.</small></div>
}