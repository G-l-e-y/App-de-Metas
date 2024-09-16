const { select, input, checkbox} = require('@inquirer/prompts') 
const fs = require("fs").promises
//pega um prompt da pasta importada de node para utilizar neste código

let mensagem = "App de Metas";

let metas

const carregarMetas = async () => {
    try {
        const dados = await fs.readFile("metas.json", "utf-8")
        metas = JSON.parse(dados)
    }
    catch(erro) {
        metas = []
    }
}

const salvarMetas = async () => {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async () => {
    const meta = await input({ message: "Digite uma meta:"})

    if(meta.lenght == 0) {
        mensagem = 'A Meta não pode ser vazia.'
        return
    }

    metas.push(
        { value: meta, checked: false}
    )

    mensagem = "Meta cadastrada com sucesso"
}

const listarMetas = async () => {
    if(metas.length == 0) {
        mensagem = "Sem Metas existentes"
        return
    }
    const respostas = await checkbox({
        message: "Use as setas para mudar de meta, o Space para marcar ou desmarcar e o Enter para finalizar essa etapa",
        choices: [...metas],
        instructions: false,
    })

    metas.forEach((m) => { 
        m.checked = false
    })
// ^ este 'forEach' foi colocado aqui antes do 'if' pois estava dando um bug que não desmarcava as opções da lista.
    if(respostas.length == 0) {
        mensagem = 'Nenhuma meta selecionada'
        return
    }


    respostas.forEach((resposta) => {
        const meta = metas.find((m) => {
            return m.value == resposta 
        })

        meta.checked = true
    })

    mensagem = 'Meta(s) marcada(s) como concluída(s)'

}

const metasRealizadas = async () => {
    if(metas.length == 0) {
        mensagem = "Sem Metas existentes"
        return
    }

    const realizadas = metas.filter((meta) => {
        return meta.checked
    })

    if(realizadas.lenght == 0) {
        mensagem = "Não há metas realizadas"
        return
    }

    await select({
        message: "Metas Realizadas",
        choices: [...realizadas]
    })
}
const metasAbertas = async () => {
    if(metas.length == 0) {
        mensagem = "Sem Metas existentes"
        return
    }

    const abertas = metas.filter((meta) => {
        return meta.checked != true 
    })

    if(abertas.length == 0) {
        mensagem = "Não existem metas abertas"
        return
    }

    await select({
        message: "Metas Abertas",
        choices: [...abertas]
    })
}
//deletador de metas
const deletarMetas = async () => {
    if(metas.length == 0) {
        mensagem = "Sem Metas existentes"
        return
    }
    
    const metasDesmarcadas = metas.map((meta) => {
        return { value: meta.value, checked: false }
    })

    const itensADeletar = await checkbox({
        message: "Use as setas para mudar de meta, o Space para marcar ou desmarcar e o Enter para finalizar essa etapa",
        message: "Selecione o item para deletar",
        choices: [...metasDesmarcadas],
        instructions: false,
    })

    if(itensADeletar.length == 0) {
        mensagem = "Nenhum item para deletar"
        return
    }

    itensADeletar.forEach((item) => {
        metas = metas.filter((meta) => {
            return meta.value != item
        })
    })

    mensagem = "Meta(s) deletada(s) com sucesso"
//deletador de metas
}

const mostrarMensagem = () => {
    console.clear();

    if(mensagem != "") {
        console.log(mensagem)
        console.log("")
        mensagem = ""
    }
}

const start = async () => {
    await carregarMetas()

    while(true){
        mostrarMensagem()
        await salvarMetas()

        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar meta",
                    value: "Cadastrar"
                },
                {
                    name: "Listar metas",
                    value: "Listar"
                },
                {
                    name: "Metas Realizadas",
                    value: "Realizadas"

                },
                {
                    name:"Metas abertas",
                    value: "Abertas"

                },
                {
                    name: "Deletar metas",
                    value: "Deletar"
                },
                {
                    name: "Sair",
                    value: "Sair"
                }
            ]
        })

        switch(opcao) { 
//cada um desses 'case's se referem a um acima de valores constantes, o 'await' informa para a máquina que ele só pode executar essas tarefas depois que o 'async' for executado
            case "Cadastrar":
                await cadastrarMeta()
                break
            case "Listar":
                await listarMetas()
                break
            case "Realizadas":
                await metasRealizadas()
                break
            case "Abertas":
                await metasAbertas()
                break
            case "Deletar":
                await deletarMetas()
                break
            case "Sair":
                console.log('Flw')
                return
        }
    }
}

start();