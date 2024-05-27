// Data
const width = 1000;
const height = 270;

const nodes = [
    { id: "A1" },
    { id: "A2" },
    { id: "A3" },
    { id: "Q1" },
    { id: "Q2" },
    { id: "Q3" },
    { id: "K1" },
    { id: "K2" },
    { id: "K3" }
];
const links = [
    { source: "A1", target: "Q1", value: 1, qtd: null },
    { source: "A1", target: "Q3", value: 2, qtd: null },
    { source: "A2", target: "Q1", value: 3, qtd: null },
    { source: "A2", target: "Q2", value: 3, qtd: null },
    { source: "A2", target: "Q3", value: 3, qtd: null },
    { source: "A3", target: "Q2", value: 2, qtd: null },
    { source: "A3", target: "Q1", value: 1, qtd: null },
    { source: "A3", target: "Q3", value: 2, qtd: null },
    { source: "Q1", target: "K1", value: 1, qtd: 2 },
    { source: "Q1", target: "K1", value: 3, qtd: 1 },
    { source: "Q2", target: "K1", value: 2, qtd: 1 },
    { source: "Q2", target: "K1", value: 3, qtd: 1 },
    { source: "Q2", target: "K2", value: 2, qtd: 1 },
    { source: "Q2", target: "K2", value: 3, qtd: 1 },
    { source: "Q3", target: "K3", value: 2, qtd: 2 },
    { source: "Q3", target: "K3", value: 3, qtd: 1 },
];

let maxNode = 0;
let minNode = 0;

const aux_nodes = JSON.parse(JSON.stringify(nodes))
const aux_links = JSON.parse(JSON.stringify(links))

// Functions
function mapSankey(nodes, links, width, height, mod) {

    // Função para calcular os valores para cada nó
    function calculateNodeValues(nodes, links) {
        nodes.forEach(node => {
            const nodeLinks = links.filter(link => link.source === node.id || link.target === node.id);
            node.value = nodeLinks.reduce((acc, link) => acc + link.value, 0);
        });
    }

    function mapLinksToNodes(nodes, links) {
        links.forEach(link => {
            const sourceNode = nodes.find(node => node.id === link.source);
            const targetNode = nodes.find(node => node.id === link.target);

            // Verificar se o nó de origem foi encontrado
            if (sourceNode) {
                if (!sourceNode.sourceLinks) sourceNode.sourceLinks = [];
                sourceNode.sourceLinks.push(link);
            }

            // Verificar se o nó de destino foi encontrado
            if (targetNode) {
                if (!targetNode.targetLinks) targetNode.targetLinks = [];
                targetNode.targetLinks.push(link);
            }
        });
    }


    // Função para agrupar os nós por inicial do ID
    function groupNodesByInitial(nodes) {
        const groups = {};
        nodes.forEach(node => {
            const initial = node.id.charAt(0);
            if (!groups[initial]) {
                groups[initial] = [];
            }
            groups[initial].push(node);
        });
        return groups;
    }

    // Função para mapear os nomes para os nós
    function mapNamesToNodes(nodes, links) {
        for (let i = 0; i < links.length; i++) {
            links[i].source = nodes.find(node => node.id === links[i].source);
            links[i].target = nodes.find(node => node.id === links[i].target);
        }
    }

    // Função para ordenar os links por valor
    function sortLinksByValue(links) {
        links.sort((a, b) => a.value - b.value);
    }

    // Função para mapear a posição inicial dos links
    function mapInitialLinkPositions(nodes, mod) {
        const strokeFactor = mod / 2;
        nodes.forEach(node => {
            if (node?.sourceLinks) {
                node.sourceLinks.sort((a, b) => a.value - b.value);
                node?.sourceLinks.forEach((link, i) => {
                    const prevLink = node?.sourceLinks[i - 1];
                    if (i === 0) {
                        link.x0 = node.x0 + mod;
                        if (link.qtd == null)
                            link.y0 = node.y0 + strokeFactor;
                        else
                            link.y0 = node.y0 + link.qtd * mod / 2;
                    } else {
                        if (link.value == prevLink.value) {
                            link.x0 = prevLink.x0;
                            link.y0 = prevLink.y0;
                        } else {
                            link.x0 = node.x0 + mod;
                            if (link.qtd == null)
                                link.y0 = prevLink.y0 + mod;
                            else
                                link.y0 = prevLink.y0 + prevLink.qtd * mod / 2 + link.qtd * mod / 2;
                        }

                    }
                });

            }
        });
    }

    // Função para mapear a posição final dos links
    function mapFinalLinkPositions(nodes, mod) {
        nodes.forEach(node => {
            if (node.targetLinks) {
                node.targetLinks.sort((a, b) => a.value - b.value);
                node.targetLinks.forEach((link, i) => {
                    const prevLink = node?.targetLinks[i - 1];
                    if (i === 0) {
                        link.x1 = node.x0;
                        if (link.qtd == null)
                            link.y1 = node.y0 + mod / 2;
                        else
                            link.y1 = node.y0 + link.qtd * mod / 2;
                    } else {
                        link.x1 = node.x0;
                        if (link.qtd == null)
                            link.y1 = prevLink.y1 + mod;
                        else
                            link.y1 = prevLink.y1 + prevLink.qtd * mod / 2 + link.qtd * mod / 2;;
                    }
                });
            }
        });
    }

    function calculateMidpoints(links) {
        // Criar um mapa para armazenar os pontos médios para cada valor e destino (target) único
        const midpointMap = {};

        // Iterar sobre os links
        links.forEach(link => {
            // Verificar se o link tem qtd definido e não é null
            if (link.qtd != null) {
                // Construir uma chave única com base no valor do link e no ID do destino (target)
                const key = link.value + '_' + link.target.id;

                // Verificar se já existe um ponto médio registrado para esta chave
                if (!midpointMap[key]) {
                    // Se não existir, criar um novo ponto médio com base nos pontos inicial e final do link
                    midpointMap[key] = {
                        x: (link.x0 + link.x1) / 2,
                        y: (link.y0 + link.y1) / 2
                    };
                }

                // Atribuir os pontos médios aos objetos de link
                link.midpoint = midpointMap[key];
            }
        });
    }

    // Passo 1: Calcular os valores para cada nó
    calculateNodeValues(nodes, links);

    // Passo 2: Mapear os links para cada nó
    mapLinksToNodes(nodes, links);

    // Passo 3: Agrupar os nós por inicial do ID
    const nodeGroups = groupNodesByInitial(nodes);

    // Posicionar os grupos
    const x0 = 0;
    const x1 = width / 2 - mod / 2;
    const x2 = width - mod;

    // Iterar sobre os grupos de nós
    const groups = Object.values(nodeGroups);

    groups.forEach((group, index) => {
        const x = (index === 0) ? x0 : (index === 1) ? x1 : x2;
        let y0 = 0;

        // Iterar sobre os nós do grupo
        group.forEach(node => {
            const isK = node.id[0] == 'K';
            const isQ = node.id[0] == 'Q';
            const linksQtd = () => {
                let count = 0;
                if (node?.sourceLinks) {
                    const uniqueValues = new Set();
                    node.sourceLinks.forEach(link => {
                        uniqueValues.add(link.value);
                    });
                    count += uniqueValues.size;
                }
                if (node?.targetLinks) {
                    const uniqueValues = new Set();
                    node.targetLinks.forEach(link => {
                        uniqueValues.add(link.value);
                    });
                    count += uniqueValues.size;
                }
                return count;
            }

            if (isQ) {
                let height = 0;

                if (node.sourceLinks) {
                    node.sourceLinks.sort((a, b) => a.value - b.value).forEach((link, i) => {
                        if (i === 0 || link.value !== node.sourceLinks[i - 1].value) {
                            height += link.qtd * mod;
                        }
                    });
                }

                const y1 = y0 + height;

                node.x0 = x;
                node.x1 = x + mod;
                node.y0 = y0;
                node.y1 = y1;

                y0 = y1 + mod; // Adicionando gap de 10 entre os nós

            } else if (isK) {
                let height = 0;
                if (node.targetLinks)
                    node.targetLinks.forEach(link => {
                        height += link.qtd * mod
                    })

                const y1 = y0 + height;

                node.x0 = x;
                node.x1 = x + mod;
                node.y0 = y0;
                node.y1 = y1;

                y0 = y1 + mod; // Adicionando gap de 10 entre os nós

            }
            else {
                const y1 = y0 + linksQtd() * mod;

                // Atualizar os valores dos nós
                node.x0 = x;
                node.x1 = x + mod;
                node.y0 = y0;
                node.y1 = y1;

                // Atualizar y0 para o próximo nó e considerar o gap
                y0 = y1 + mod; // Adicionando gap de 10 entre os nós
            }
        });
    });

    // Passo 4: Mapear nomes para os nós
    mapNamesToNodes(nodes, links);

    // Passo 5: Mapear a posição inicial dos links
    mapInitialLinkPositions(nodes, mod);

    // Passo 6: Ordenar os links por valor
    sortLinksByValue(links);

    // Passo 7: Mapear a posição final dos links
    mapFinalLinkPositions(nodes, mod);

    // Passo 8: Mapear midpoints
    calculateMidpoints(links)

    maxNode = maxWeight(nodes)[0]
    minNode = maxWeight(nodes)[1]
}

function maxWeight(nodes) {
    let maxNode = 0;
    let minWeight = Infinity;
    nodes.forEach(node => {
        if (node.targetLinks) {
            let weight = 0;
            node.targetLinks.forEach(link => {
                weight += link.value;
            });
            if (weight > maxNode) {
                maxNode = weight;
            }
            if (weight < minWeight) {
                minWeight = weight;
            }
        }
    });
    return [maxNode, minWeight];
}
function drawSankey(nodes, links, filteredNodes, filteredLinks) {
    d3.select("#sankeyDiagram").selectAll("*").remove();

    // Criando o SVG
    const svg = d3.select("#sankeyDiagram")
        .attr("width", width)
        .attr("height", height)

    // Renderizando os nós
    const drawLinks = filteredLinks ? links.filter(link => {
        return filteredLinks.some(filteredLink => {
            return filteredLink.source === link.source.id && filteredLink.target === link.target.id && filteredLink.value === link.value;
        });
    }) : links;
    const drawNodes = filteredNodes ? nodes.filter(node => {
        return filteredNodes.includes(node) && drawLinks.some(link => link.source === node || link.target === node);
    }) : nodes;

    const nodeRects = svg.selectAll(".node")
        .data(drawNodes)
        .enter().append("rect")
        .attr("class", filteredLinks ? 'node-gray' : 'node')
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .on("mouseover", handleNodeMouseOver)
        .on("mouseout", handleNodeMouseOut);

    if (filteredLinks)
        svg.selectAll(".node2")
            .data(drawNodes)
            .enter().append("rect")
            .attr("class", 'node2')
            .attr("x", d => d.x0)
            .attr("y", d => {
                let Ys = []
                const links = drawLinks.filter(link => link.source.id === d.id || link.target.id === d.id);
                links.forEach(link => {
                    if (link.source.id === d.id) {
                        Ys.push(link.y0 - (link.qtd ? link.qtd * 10 : 10));
                    } else {
                        Ys.push(link.y1 - (link.qtd ? link.qtd * 10 : 10));
                    }
                });
                return Math.min(...Ys);
            })
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => {
                let Ys0 = []
                let Ys1 = []
                const links = drawLinks.filter(link => link.source.id === d.id || link.target.id === d.id);

                links.forEach(link => {
                    if (link.source.id === d.id) {
                        Ys0.push(link.y0 - (link.qtd ? link.qtd * 10 : 10));
                    } else {
                        Ys0.push(link.y1 - (link.qtd ? link.qtd * 10 : 10));
                    }
                });
                links.forEach(link => {
                    if (link.source.id === d.id) {
                        Ys1.push(link.y0 + (link.qtd ? link.qtd * 10 : 10));
                    } else {
                        Ys1.push(link.y1 + (link.qtd ? link.qtd * 10 : 10));
                    }
                });
                const height = Math.max(...Ys1) - Math.min(...Ys0)
                return height;
            })

    // Adicionando texto aos nós
    const nodeTexts = svg.selectAll(".node-text")
        .data(drawNodes)
        .enter().append("text")
        .attr("class", "node-text")
        .attr("x", d => (d.x0 + d.x1) / 2)
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(d => d.id);

    // Importante: Adicione a função curveBasis do D3.js
    const line = d3.line().curve(d3.curveBasis);

    // Dentro da seleção de linkPaths, atualize o atributo "d" para usar a curva
    const linkPaths = svg.selectAll(".link")
        .data(drawLinks)
        .enter().append("path")
        .attr("class", "link")
        .attr('stroke', d => {
            if (d.target.id[0] == 'K' && d.qtd == 0) {
                return 'none'
            }
            if (d.value == 1) {
                return '#F27777';
            } else if (d.value == 2) {
                return '#F2CC85';
            } else if (d.value == 3) {
                return '#9AD96C';
            }
        })
        .attr('fill', 'none')
        .attr('stroke-width', d => {
            return d.qtd ? d.qtd * 20 : 20
        })
        .attr("d", d => {
            const points = d.qtd == null ? [
                [d.x0, d.y0],
                [(d.x1 + d.x0) / 2, d.y0],
                [(d.x1 + d.x0) / 2, d.y1],
                [d.x1, d.y1]
            ] : [
                [d.x0, d.y0],
                [(d.x0 + d.midpoint.x) / 2, d.y0],
                [d.midpoint.x, d.midpoint.y],
                [(d.x1 + d.midpoint.x) / 2, d.y1],
                [d.x1, d.y1]
            ];

            // Use the line function with curveBasis to create a curved path
            const line = d3.line().curve(d3.curveBasis);
            const path = line(points);
            return line(points);
        })
        .on("mouseover", function (d) {
            d3.select(this)
                .style("stroke-opacity", "2").raise();
            const link = d?.target?.__data__;
            const value = link.value;

            nodeRects.filter(n => {
                return link.source === n || link.target === n;
            }).style("opacity", "2")

            const node = (link.target.id[0] == "Q") ? link.target : link.source;

            const posLink = linkPaths.filter(link => (link.source === node || link.target === node) && link.value == value)
                .style("stroke-opacity", "1")

            const finalnodes = posLink._groups[0].map(link => {
                const data = link.__data__;
                if (data.source.id[0] == "Q")
                    return data.target;
                if (data.target.id[0] == "A")
                    return data.source;
                return false
            });

            finalnodes.forEach(node => {
                nodeRects.filter(n => {
                    return node === n || node === n;
                }).style("opacity", "2")
            })



            // Exibir dados sobre o nó
            tooltip.style("opacity", 0.9)
                .html(`<h1>Detalhes</h1>Link: ${link.source.id}⭢${link.target.id}<br>Valor: ${link.value}`)
                .style("left", d3.event?.pageX + 10 + "px")
                .style("top", d3.event?.pageY - 28 + "px");

        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("stroke-opacity", "0.65");

            const link = d.target.__data__;
            const value = link.value;



            nodeRects.filter(n => {
                return link.source === n || link.target === n;
            }).style("opacity", "0.7");

            const node = (link.target.id[0] == "Q") ? link.target : link.source;

            const posLink = linkPaths.filter(link => (link.source === node || link.target === node) && link.value == value)
                .style("stroke-opacity", "0.65")

            const finalnodes = posLink._groups[0].map(link => {
                const data = link.__data__;
                if (data.source.id[0] == "Q")
                    return data.target;
                if (data.target.id[0] == "A")
                    return data.source;
                return false
            });

            finalnodes.forEach(node => {
                nodeRects.filter(n => {
                    return node === n || node === n;
                }).style("opacity", "0.65")
            })

            // Ocultar o tooltip
            tooltip.style("opacity", 0);
        })

    // Criar o tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    function handleNodeMouseOver(d) {
        d3.select(this)
            .style("opacity", "2");


        const node = d.target.__data__;
        const id = node.id;

        // Selecionar os links relacionados ao nó
        const selectedLinks = linkPaths.filter(link => link.source === node || link.target === node)
            .style("stroke-opacity", "1")
        const link = d?.target?.__data__;


        // Destacar os nós relacionados ao nó
        const posNodes = nodeRects.filter(n => {
            return n === node || links.some(link => link.source === node && link.target === n || link.target === node && link.source === n);
        }).style("opacity", "2");

        const selectedLinksData = selectedLinks._groups[0].map(link => link.__data__)


        posNodes._groups[0].forEach((node, index) => {
            let linksValues = []
            const data = node.__data__;
            selectedLinksData.forEach(link => {
                if (link.target == data)
                    linksValues.push(link.value)
                if (link.source == data)
                    linksValues.push(link.value)

            })
            const finalLinks = linkPaths.filter(link => {
                if (id[0] == "A")
                    return link.source === data && linksValues.includes(link.value)
                if (id[0] == "K")
                    return link.target === data && linksValues.includes(link.value)
                return false
            })
                .style("stroke-opacity", "1")

            const finalNodes = []
            finalLinks._groups[0].forEach(link => {
                const data = link.__data__;
                if (id[0] == "A")
                    finalNodes.push(data.target)
                if (id[0] == "K")
                    finalNodes.push(data.source)
            })

            nodeRects.filter(n => {
                return finalNodes.includes(n);
            }).style("opacity", "2");
        })


        // const posLinks = posNodes.map(node => {
        //     if (node.id[0] == "A")
        //         return node.sourceLinks
        //     if (node.id[0] == "K")
        //         return node.targetLinks;
        //     return false;
        // })


        // Exibir dados sobre o nó
        tooltip.style("opacity", 0.9)
            .html(`<h1>Detalhes</h1>ID: ${node.id}<br>Valor: ${node.value}`)
        // Exibir dados sobre o nó
        tooltip.style("opacity", 0.9)
            .html(`<h1>Detalhes</h1>Link: ${link.source.id}⭢${link.target.id}<br>Valor: ${link.value}`)
            .style("left", d3.event?.pageX + 10 + "px")
            .style("top", d3.event?.pageY - 28 + "px");
    }

    function handleNodeMouseOut(d) {
        d3.select(this)
            .style("opacity", "0.7");



        const node = d.target.__data__;
        const id = node.id;

        // Selecionar os links relacionados ao nó
        const selectedLinks = linkPaths.filter(link => link.source === node || link.target === node)
            .style("stroke-opacity", "0.65")

        // Destacar os nós relacionados ao nó
        const posNodes = nodeRects.filter(n => {
            return n === node || links.some(link => link.source === node && link.target === n || link.target === node && link.source === n);
        }).style("opacity", "0.7");

        const selectedLinksData = selectedLinks._groups[0].map(link => link.__data__)


        posNodes._groups[0].forEach((node, index) => {
            let linksValues = []
            const data = node.__data__;
            selectedLinksData.forEach(link => {
                if (link.target == data)
                    linksValues.push(link.value)
                if (link.source == data)
                    linksValues.push(link.value)

            })
            const finalLinks = linkPaths.filter(link => {
                if (id[0] == "A")
                    return link.source === data && linksValues.includes(link.value)
                if (id[0] == "K")
                    return link.target === data && linksValues.includes(link.value)
                return false
            })
                .style("stroke-opacity", "0.65")

            const finalNodes = []
            finalLinks._groups[0].forEach(link => {
                const data = link.__data__;
                if (id[0] == "A")
                    finalNodes.push(data.target)
                if (id[0] == "K")
                    finalNodes.push(data.source)
            })

            nodeRects.filter(n => {
                return finalNodes.includes(n);
            }).style("opacity", "0.7");
        })
        // Ocultar o tooltip
        tooltip.style("opacity", 0);
    }
}

// Run somethings

mapSankey(nodes, links, width, height, 20);
drawSankey(nodes, links);

// Resetando os inputs
document.getElementById("fromInput").max = maxNode;
document.getElementById("toInput").max = maxNode;
document.getElementById("fromSlider").max = maxNode;
document.getElementById("toSlider").max = maxNode;
document.getElementById("fromInput").min = minNode;
document.getElementById("toInput").min = minNode;
document.getElementById("fromSlider").min = minNode;
document.getElementById("toSlider").min = minNode;

document.getElementById("fromInput").value = minNode;
document.getElementById("toInput").value = "";
document.getElementById("fromSlider").value = minNode;
document.getElementById("toSlider").value = maxNode;

document.getElementById("fromInput").dispatchEvent(new Event('input'));
document.getElementById("toInput").dispatchEvent(new Event('input'));
document.getElementById("fromSlider").dispatchEvent(new Event('input'));
document.getElementById("toSlider").dispatchEvent(new Event('input'));


function handleFilter() {
    const selectClass = document.getElementById("selectClass").value;
    const selectSide = document.getElementById("selectSide").value;
    const minWeight = document.getElementById("fromInput").value;
    const maxWeight = document.getElementById("toInput").value;

    let filteredLinks = JSON.parse(JSON.stringify(aux_links));
    let filteredNodes = JSON.parse(JSON.stringify(aux_nodes));

    // Depois filtrar por intervalo de pesos
    let descartedNodes = []
    filteredNodes = nodes.filter(node => {
        if (node.targetLinks) {
            let weight = 0
            node?.targetLinks.map(link => {
                weight = weight + link.value
            })
            if (weight >= minWeight && weight <= maxWeight) {
                return true;
            } else {
                descartedNodes.push(node);
                return false;
            }
        }
        return true;
    })

    filteredLinks = filteredLinks.filter(link => {
        return !descartedNodes.some(node => node.id === link.source || node.id === link.target);
    });

    // Filtrar por classe
    if (selectClass !== "") {
        filteredLinks = filteredLinks.filter(link => link.value == selectClass);

        let aux_nodes = []

        filteredLinks.forEach((link) => {
            if (link.source)
                aux_nodes.push(link.source)
            if (link.target)
                aux_nodes.push(link.target)
        })

        filteredNodes = filteredNodes.filter((node) => aux_nodes.includes(node.id));
    }
    // Depois filtrar por lado
    if (selectSide !== "") {
        if (selectSide == "aq") filteredNodes = filteredNodes.filter((node) => node.id[0] != "K")
        if (selectSide == "qk") filteredNodes = filteredNodes.filter((node) => node.id[0] != "A")

        let aux_links = []

        filteredLinks.forEach((link) => {
            if (filteredNodes.find((node) => node.id === link.source) && filteredNodes.find((node) => node.id === link.target)) {
                aux_links.push(link)
            }
        })

        filteredLinks = aux_links
    }

    //Depois chamar mapSankey
    drawSankey(nodes, links, filteredNodes, filteredLinks);
}