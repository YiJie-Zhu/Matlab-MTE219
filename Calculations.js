const nodeData = [
    {
        x:0,
        y:0,
        forceExternalX: 594.486,
        forceExternalY: 0,
        externalForceType: 'roller'
    },
    {
        x:0.3,
        y:0,
        forceExternalX: 0,
        forceExternalY: -99.081,
        externalForceType: 'load'
    },
    {
        x:0,
        y:0.05,
        forceExternalX: -594.486,
        forceExternalY: 99.081,
        externalForceType: 'pin'
    },
    {
        x:0.2,
        y:0,
        forceExternalX: 0,
        forceExternalY: 0,
        externalForceType: null
    },
    {
        x:0.25,
        y:0.05,
        forceExternalX: 0,
        forceExternalY: 0,
        externalForceType: null
    },
    {
        x:0.1,
        y:0.05,
        forceExternalX: 0,
        forceExternalY: 0,
        externalForceType: null
    }
];

const members = [
    {
        node1: 0,
        node2: 2,
        force: 99.081,
        zIndex: 0
    },
    {
        node1: 0,
        node2: 3,
        force: -396.324,
        zIndex: 2
    },
    {
        node1: 4,
        node2: 3,
        force: -140.122,
        zIndex: 1
    },
    {
        node1: 4,
        node2: 1,
        force: 140.122,
        zIndex: 0
    },
    {
        node1: 1,
        node2: 3,
        force: -99.081,
        zIndex: 3
    },
    {
        node1: 5,
        node2: 0,
        force: -221.552,
        zIndex: 1
    },
    {
        node1: 5,
        node2: 3,
        force: 221.552,
        zIndex: 0
    },
    {
        node1: 2,
        node2: 5,
        force: 594.486,
        zIndex: 2
    },
    {
        node1: 5,
        node2: 4,
        force: 198.162,
        zIndex: 3
    }
];

function length(node1, node2){
    return (
        Math.sqrt(Math.pow((node2.x-node1.x), 2) + Math.pow((node2.y-node1.y), 2))
    );
}
nodeArray = [];

function getConnectedNodes(nodeNum){
    const connectedNodes = [];
    for(let i = 0; i < members.length; i++){
        if(nodeNum === members[i].node1){
            connectedNodes.push({
                nodeNum: members[i].node2,
                x: nodeData[members[i].node2].x,
                y: nodeData[members[i].node2].y,
                forceExternalX: nodeData[members[i].node2].forceExternalX,
                forceExternalY: nodeData[members[i].node2].forceExternalY,
                memberForce: members[i].force,
                zIndex: members[i].zIndex
            })
        }
        if(nodeNum === members[i].node2){
            connectedNodes.push({
                nodeNum: members[i].node1,
                x: nodeData[members[i].node1].x,
                y: nodeData[members[i].node1].y,
                forceExternalX: nodeData[members[i].node1].forceExternalX,
                forceExternalY: nodeData[members[i].node1].forceExternalY,
                memberForce: members[i].force,
                zIndex: members[i].zIndex
            })
        }
    }
    return connectedNodes;
}

// console.log(getConnectedNodes(0));

function getForces(nodeNum){
    const connectedNodes = getConnectedNodes(nodeNum);
    const forcesFromEachMember = [];
    for(let i = 0; i< connectedNodes.length; i++){
        const forceX = connectedNodes[i].memberForce*(connectedNodes[i].x- nodeData[nodeNum].x)/length(nodeData[nodeNum], connectedNodes[i]);
        const forceY = connectedNodes[i].memberForce*(connectedNodes[i].y- nodeData[nodeNum].y)/length(nodeData[nodeNum], connectedNodes[i]);
        forcesFromEachMember.push({
            fromNode: connectedNodes[i].nodeNum,
            forceX: forceX,
            forceY: forceY,
            zIndex: connectedNodes[i].zIndex
        });
    }

    forcesFromEachMember.push({
        fromNode: nodeNum,
        forceX: nodeData[nodeNum].forceExternalX,
        forceY: nodeData[nodeNum].forceExternalY,
        zIndex: null
    });

    return forcesFromEachMember;
}

function getDowelLength(nodeNum){
    const connectedNodes = getConnectedNodes(nodeNum);
    const zIndiceis = connectedNodes.map(node => node.zIndex);
    return Math.max(...zIndiceis) + 1;
}

let maxShear = null;

function getMaxShear(nodeNum){
    const forces = getForces(nodeNum);
    const forcesXByZIndex = [];
    const forcesYByZIndex = [];
    forcesXByZIndex.length = getDowelLength(nodeNum) - 1;
    forcesYByZIndex.length = forcesXByZIndex.length;
    forcesXByZIndex.fill(0);
    forcesYByZIndex.fill(0);
    for(let i = 0; i < forces.length-1; i++){
        forcesXByZIndex[forces[i].zIndex] = forces[i].forceX;
        forcesYByZIndex[forces[i].zIndex] = forces[i].forceY;
    }
    const shearXByZIndex = [];
    const shearYByZIndex = [];
    for(let i = 0; i < forcesXByZIndex.length; i++){
        let shearX = nodeData[nodeNum].forceExternalX/2, shearY = nodeData[nodeNum].forceExternalY/2;
        for(let j = 0; j < i; j++){
            shearX += forcesXByZIndex[j];
            shearY += forcesYByZIndex[j];
        }
        shearXByZIndex.push(shearX);
        shearYByZIndex.push(shearY);
    }
    const shearMagnitudeByZIndex = [];
    for(let i = 0; i < shearYByZIndex.length; i++){
        shearMagnitudeByZIndex.push(Math.sqrt(Math.pow(shearXByZIndex[i], 2) + Math.pow(shearYByZIndex[i], 2)));
    }
    return Math.max(...shearMagnitudeByZIndex) > Math.abs(Math.min(...shearMagnitudeByZIndex)) ? Math.max(...shearMagnitudeByZIndex) : Math.min(...shearMagnitudeByZIndex);
}

function getMaxMoment(nodeNum){
    const forces = getForces(nodeNum);
    const forcesXByZIndex = [];
    const forcesYByZIndex = [];
    forcesXByZIndex.length = getDowelLength(nodeNum) - 1;
    forcesYByZIndex.length = forcesXByZIndex.length;
    forcesXByZIndex.fill(0);
    forcesYByZIndex.fill(0);
    for(let i = 0; i < forces.length-1; i++){
        forcesXByZIndex[forces[i].zIndex] = forces[i].forceX;
        forcesYByZIndex[forces[i].zIndex] = forces[i].forceY;
    }
    const shearXByZIndex = [];
    const shearYByZIndex = [];
    for(let i = 0; i < forcesXByZIndex.length; i++){
        let shearX = nodeData[nodeNum].forceExternalX/2, shearY = nodeData[nodeNum].forceExternalY/2;
        for(let j = 0; j < i; j++){
            shearX += forcesXByZIndex[j];
            shearY += forcesYByZIndex[j];
        }
        shearXByZIndex.push(shearX);
        shearYByZIndex.push(shearY);
    }
    const momentXByZIndex = [];
    const momentYByZIndex = [];
    for(let i = 0; i < shearXByZIndex.length; i++){
        let momentX = 0, momentY = 0;
        for(let j = 0; j < i; j++){
            momentX += shearXByZIndex[j];
            momentY += shearYByZIndex[j];
        }
        momentXByZIndex.push(momentX);
        momentYByZIndex.push(momentY);
    }
    const momentMagnitudeByZIndex = [];
    for(let i = 0; i < momentYByZIndex.length; i++){
        momentMagnitudeByZIndex.push(Math.sqrt(Math.pow(momentXByZIndex[i], 2) + Math.pow(momentYByZIndex[i], 2)));
    }
    return Math.max(...momentMagnitudeByZIndex) > Math.abs(Math.min(...momentMagnitudeByZIndex)) ? Math.max(...momentMagnitudeByZIndex) : Math.min(...momentMagnitudeByZIndex);
}

console.log(getForces(0));
console.log(getDowelLength(0));
console.log(getMaxShear(0));
console.log(getMaxMoment(0));