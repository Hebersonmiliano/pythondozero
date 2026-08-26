export type CommandDefinition={command:string;definition:string;syntax?:string};

export const commandDefinitions:Record<string,CommandDefinition[]>={
 "programacao-python":[
  {command:"print()",definition:"Função que mostra uma mensagem ou resultado na tela.",syntax:'print("Olá, mundo!")'},
  {command:"# comentário",definition:"Texto explicativo ignorado pelo Python durante a execução.",syntax:"# Meu primeiro programa"}
 ],
 "print":[
  {command:"print()",definition:"Exibe textos, números e valores de variáveis no terminal.",syntax:'print("Curso de Python")'},
  {command:"aspas",definition:"Delimitam textos. Podem ser simples ou duplas.",syntax:'"Python" ou \'Python\''},
  {command:"*",definition:"Repete uma string quando usada com um número inteiro.",syntax:'print("=" * 20)'}
 ],
 "variaveis":[
  {command:"=",definition:"Operador de atribuição: guarda um valor em uma variável.",syntax:'idade = 16'},
  {command:"str",definition:"Tipo usado para textos.",syntax:'nome = "Mariana"'},
  {command:"int",definition:"Tipo usado para números inteiros.",syntax:"idade = 16"},
  {command:"float",definition:"Tipo usado para números decimais.",syntax:"altura = 1.68"},
  {command:"bool",definition:"Tipo lógico que pode ser True ou False.",syntax:"matriculado = True"}
 ],
 "input":[
  {command:"input()",definition:"Mostra uma pergunta e recebe o texto digitado pelo usuário.",syntax:'nome = input("Nome: ")'},
  {command:"int()",definition:"Converte um valor para número inteiro.",syntax:'idade = int(input("Idade: "))'},
  {command:"float()",definition:"Converte um valor para número decimal.",syntax:'nota = float(input("Nota: "))'}
 ],
 "operadores":[
  {command:"+",definition:"Realiza adição.",syntax:"total = 10 + 5"},
  {command:"-",definition:"Realiza subtração.",syntax:"saldo = 20 - 8"},
  {command:"*",definition:"Realiza multiplicação.",syntax:"preco = 3 * 10"},
  {command:"/",definition:"Realiza divisão e produz um valor decimal.",syntax:"media = soma / 2"},
  {command:"//",definition:"Realiza divisão inteira, descartando a parte decimal.",syntax:"resultado = 7 // 2"},
  {command:"%",definition:"Retorna o resto de uma divisão.",syntax:"resto = 7 % 2"},
  {command:"**",definition:"Calcula uma potência.",syntax:"quadrado = 5 ** 2"}
 ],
 "if":[
  {command:"if",definition:"Executa um bloco somente quando a condição é verdadeira.",syntax:"if idade >= 18:"},
  {command:">=",definition:"Verifica se o valor da esquerda é maior ou igual ao da direita.",syntax:"idade >= 18"},
  {command:":",definition:"Indica o início de um bloco de código indentado.",syntax:"if condicao:"}
 ],
 "elif-else":[
  {command:"if",definition:"Inicia uma estrutura de decisão.",syntax:"if media >= 6:"},
  {command:"elif",definition:"Testa uma condição alternativa quando as anteriores foram falsas.",syntax:"elif media >= 4:"},
  {command:"else",definition:"Executa o caminho restante quando nenhuma condição anterior foi verdadeira.",syntax:"else:"}
 ],
 "relacionais":[
  {command:">",definition:"Maior que.",syntax:"idade > 18"},{command:"<",definition:"Menor que.",syntax:"nota < 6"},
  {command:">=",definition:"Maior ou igual.",syntax:"media >= 6"},{command:"<=",definition:"Menor ou igual.",syntax:"tentativas <= 3"},
  {command:"==",definition:"Compara se dois valores são iguais.",syntax:'senha == "python"'},
  {command:"!=",definition:"Compara se dois valores são diferentes.",syntax:"resposta != 0"}
 ],
 "logicos":[
  {command:"and",definition:"Exige que todas as condições sejam verdadeiras.",syntax:"nivel >= 15 and possui_chave"},
  {command:"or",definition:"Exige que pelo menos uma condição seja verdadeira.",syntax:"idoso or estudante"},
  {command:"not",definition:"Inverte um valor lógico.",syntax:"not bloqueado"},
  {command:".lower()",definition:"Converte um texto para letras minúsculas.",syntax:"resposta.lower()"}
 ],
 "while":[
  {command:"while",definition:"Repete um bloco enquanto a condição for verdadeira.",syntax:"while contador <= 5:"},
  {command:"+=",definition:"Soma um valor à variável e salva o novo resultado.",syntax:"contador += 1"},
  {command:"break",definition:"Interrompe imediatamente o laço de repetição.",syntax:"break"}
 ],
 "for":[
  {command:"for",definition:"Percorre os itens de uma sequência.",syntax:"for numero in numeros:"},
  {command:"in",definition:"Indica a sequência que será percorrida ou verifica pertencimento.",syntax:"for item in lista:"},
  {command:"range()",definition:"Cria uma sequência de números para controlar repetições.",syntax:"range(1, 6)"}
 ],
 "range":[
  {command:"range(início, fim, passo)",definition:"Gera números do início até antes do fim, usando o passo informado.",syntax:"range(2, 11, 2)"},
  {command:"+=",definition:"Atualiza um contador ou acumulador.",syntax:"soma += valor"},
  {command:"float()",definition:"Converte a entrada em número decimal.",syntax:'valor = float(input("Valor: "))'}
 ],
 "strings":[
  {command:".strip()",definition:"Remove espaços extras do início e do fim do texto.",syntax:"nome.strip()"},
  {command:".upper()",definition:"Converte o texto para maiúsculas.",syntax:"nome.upper()"},
  {command:".lower()",definition:"Converte o texto para minúsculas.",syntax:"nome.lower()"},
  {command:"len()",definition:"Retorna a quantidade de caracteres ou elementos.",syntax:"len(nome)"}
 ],
 "listas":[
  {command:"[]",definition:"Cria uma lista ou acessa um elemento pelo índice.",syntax:'nomes = ["Ana", "Bia"]'},
  {command:"for ... in",definition:"Percorre cada elemento da lista.",syntax:"for nome in nomes:"},
  {command:"índice",definition:"Posição de um item; a contagem começa em zero.",syntax:"nomes[0]"}
 ],
 "manipulando-listas":[
  {command:".append()",definition:"Adiciona um elemento ao final da lista.",syntax:"alunos.append(nome)"},
  {command:".remove()",definition:"Remove a primeira ocorrência de um valor.",syntax:"alunos.remove(nome)"},
  {command:".sort()",definition:"Ordena os elementos da lista.",syntax:"alunos.sort()"},
  {command:"in",definition:"Verifica se um valor está presente na lista.",syntax:'"Ana" in alunos'},
  {command:"len()",definition:"Conta quantos elementos existem.",syntax:"len(alunos)"}
 ],
 "funcoes":[
  {command:"def",definition:"Define uma função reutilizável.",syntax:"def cabecalho():"},
  {command:"()",definition:"Em uma definição, recebe parâmetros; após o nome, executa a função.",syntax:"cabecalho()"},
  {command:"indentação",definition:"Agrupa as instruções que pertencem à função.",syntax:"    print('Olá')"}
 ],
 "parametros-retorno":[
  {command:"parâmetro",definition:"Variável recebida pela função para trabalhar com um valor.",syntax:"def dobro(numero):"},
  {command:"return",definition:"Encerra a função e devolve um resultado.",syntax:"return numero * 2"},
  {command:"argumento",definition:"Valor enviado ao chamar uma função.",syntax:"dobro(5)"}
 ],
 "erros":[
  {command:"try",definition:"Contém o código que pode gerar um erro previsto.",syntax:"try:"},
  {command:"except",definition:"Executa um tratamento quando o erro indicado acontece.",syntax:"except ValueError:"},
  {command:"ValueError",definition:"Erro gerado quando um valor não pode ser convertido para o tipo esperado.",syntax:"except ValueError:"},
  {command:"ZeroDivisionError",definition:"Erro gerado por uma tentativa de divisão por zero.",syntax:"except ZeroDivisionError:"}
 ],
 "sistema-escolar":[
  {command:"def",definition:"Organiza cada responsabilidade do sistema em uma função.",syntax:"def calcular_media(n1, n2):"},
  {command:"return",definition:"Devolve a média ou a situação calculada.",syntax:"return (n1 + n2) / 2"},
  {command:"if",definition:"Classifica o aluno conforme a média.",syntax:"if media >= 6:"},
  {command:"lista",definition:"Armazena vários alunos ou notas em uma única estrutura.",syntax:"alunos = []"}
 ],
 "python-adventure":[
  {command:"lista",definition:"Armazena inventário, personagens ou itens do jogo.",syntax:'inventario = ["Poção", "Mapa"]'},
  {command:"def",definition:"Separa ações do jogo em funções.",syntax:"def mostrar_inventario():"},
  {command:"for",definition:"Percorre e apresenta os itens do inventário.",syntax:"for item in inventario:"},
  {command:"if/elif/else",definition:"Controla escolhas, batalhas e resultados do jogador.",syntax:"if opcao == 1:"}
 ]
};
