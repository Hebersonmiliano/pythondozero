"use client";
import {useState} from "react";
type Runtime={runPythonAsync:(code:string)=>Promise<unknown>;setStdout:(o:{batched:(text:string)=>void})=>void;setStderr:(o:{batched:(text:string)=>void})=>void};
type Props={code:string;exampleCode:string;onCodeChange:(value:string)=>void;codeSaved:boolean;expectedCommands?:string[];onResult?:(ok:boolean,message:string)=>void};
declare global{interface Window{loadPyodide?:(options:{indexURL:string})=>Promise<Runtime>;pythonRuntime?:Runtime}}
export default function CodeRunner({code,exampleCode,onCodeChange,codeSaved,expectedCommands=[],onResult}:Props){
 const [inputs,setInputs]=useState(""),[output,setOutput]=useState("Clique em Executar para testar."),[running,setRunning]=useState(false),[analysis,setAnalysis]=useState("");
 const requiredInputs=(code.match(/\binput\s*\(/g)||[]).length;
 async function run(){
  const values=inputs.trim()?inputs.split(/\r?\n/):[],filledValues=values.filter(value=>value.trim().length>0);
  if(requiredInputs>1&&filledValues.length<requiredInputs){const msg=`Preencha ${requiredInputs} respostas no campo Entradas para input(), uma por linha.`;setOutput("Execução não iniciada.");setAnalysis(msg);onResult?.(false,msg);return}
  setRunning(true);setOutput("Carregando Python...");setAnalysis("");
  try{
   if(!window.loadPyodide){// @ts-expect-error módulo externo do navegador
    const module=await import(/* webpackIgnore: true */"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs");window.loadPyodide=module.loadPyodide}
   const runtime=window.pythonRuntime||await window.loadPyodide!({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"});window.pythonRuntime=runtime;
   const lines:string[]=[];runtime.setStdout({batched:text=>lines.push(text)});runtime.setStderr({batched:text=>lines.push(text)});
   const prelude=`import builtins
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
   const normalized=code.toLowerCase(),ignored=["aspas","indice","lista","parametro","argumento","indentacao","comentario"];const missing=expectedCommands.map(x=>x.replace(/[().#]/g,"").trim().toLowerCase()).filter(x=>/^[a-z_]+$/.test(x)&&x.length>1&&!ignored.includes(x)&&!normalized.includes(x)).slice(0,2);
   const msg=missing.length?`O código executou, mas revise se precisa usar: ${missing.join(", ")}.`:"Código executado sem erros. Confira se a saída atende ao enunciado.";
   setAnalysis(msg);onResult?.(missing.length===0,msg);
  }catch(error){const detail=error instanceof Error?error.message:String(error);if(detail.includes("Faltou informar um valor no campo Entradas")){const msg="Faltaram respostas para o programa. Preencha uma linha para cada pergunta feita por input().";setOutput("Execução não concluída.");setAnalysis(msg);onResult?.(false,msg)}else{const msg="O Python encontrou um erro: "+detail;setOutput(msg);setAnalysis("Leia a última linha do erro, corrija o código e execute novamente.");onResult?.(false,msg)}}
  finally{setRunning(false)}
 }
 return <div className="code-lab"><div className="code-lab-head"><div><span className="section-kicker">LABORATÓRIO PYTHON</span><h3>Execute e verifique seu código</h3></div><button onClick={()=>onCodeChange(exampleCode)}>Restaurar exemplo</button></div><textarea value={code} onChange={e=>onCodeChange(e.target.value)} spellCheck={false} aria-label="Editor de código Python"/><div className="answer-status"><span>{code.length} caracteres</span><span aria-live="polite">{codeSaved?"✓ Código salvo":"Rascunho de código"}</span></div><label className="program-inputs">Entradas para input() <small>{requiredInputs>1?`Este código solicita ${requiredInputs} respostas. Digite uma por linha, na ordem das perguntas.`:"Digite uma resposta por linha, na ordem em que o programa pedir."}</small><textarea value={inputs} onChange={e=>setInputs(e.target.value)} placeholder={"Exemplo:\nHeberson Miliano\n(62) 99999-9999\nSENAI Jardim Colorado"}/></label><button className="run-code" onClick={run} disabled={running}>{running?"Executando...":"▶ Executar e verificar"}</button><div className="code-output"><b>SAÍDA</b><pre>{output}</pre></div>{analysis&&<p className="code-analysis" role="status">{analysis}</p>}<small>O teste verifica erros de execução e os comandos essenciais. Compare também a saída com o enunciado.</small></div>
}
