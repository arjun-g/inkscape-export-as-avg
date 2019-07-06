const fs = require('fs');
const SVGO = require('svgo');
const svgson = require('svgson');

const svgo = new SVGO({
    plugins: [{
        cleanupAttrs: false,
    }, {
        removeDoctype: true,
    }, {
        removeXMLProcInst: true,
    }, {
        removeComments: true,
    }, {
        removeMetadata: true,
    }, {
        removeTitle: true,
    }, {
        removeDesc: true,
    }, {
        removeUselessDefs: true,
    }, {
        removeEditorsNSData: true,
    }, {
        removeEmptyAttrs: false,
    }, {
        removeHiddenElems: true,
    }, {
        removeEmptyText: true,
    }, {
        removeEmptyContainers: true,
    }, {
        removeViewBox: true,
    }, {
        cleanupEnableBackground: true,
    }, {
        convertStyleToAttrs: true,
    }, {
        convertColors: true,
    }, {
        convertPathData: true,
    }, {
        convertTransform: true,
    }, {
        removeUnknownsAndDefaults: true,
    }, {
        removeNonInheritableGroupAttrs: true,
    }, {
        removeUselessStrokeAndFill: false,
    }, {
        removeUnusedNS: true,
    }, {
        cleanupIDs: true,
    }, {
        cleanupNumericValues: true,
    }, {
        moveElemsAttrsToGroup: false,
    }, {
        moveGroupAttrsToElems: true,
    }, {
        collapseGroups: true,
    }, {
        removeRasterImages: false,
    }, {
        mergePaths: false,
    }, {
        convertShapeToPath: true,
    }, {
        sortAttrs: true,
    }, {
        removeDimensions: false,
    }]
});

const file = fs.readFileSync(process.argv[2]);
svgo.optimize(file, { }).then(result => {
    svgson.parse(result.data)
    .then(json => {
        let respJson = {
            type: 'AVG',
            version: '1.0'
        };
        respJson.width = parseInt(json.attributes && json.attributes.width || '100', 10);
        respJson.height = parseInt(json.attributes && json.attributes.height || '100', 10);
        respJson.items = buildItems(json.children);
        process.stdout.write(JSON.stringify(respJson, null, 4));
    });
});

function buildItems(children){
    let items = children.map(child => {
        if(child.name != 'g' && child.name != 'path')
            return null;
        let transform = parseTransform(child.attributes && child.attributes.transform);
        return {
            type: child.name === 'g' ? 'group' : 'path',
            fillOpacity: child.attributes && child.attributes['fill-opacity'] && parseFloat(child.attributes['fill-opacity']),
            fill: child.attributes && child.attributes['fill'],
            pathData: child.attributes && child.attributes['d'],
            strokeOpacity: child.attributes && child.attributes['stroke-opacity'] && parseFloat(child.attributes['stroke-opacity']),
            stroke: child.attributes && child.attributes['stroke'],
            strokeWidth: child.attributes && child.attributes['stroke-width'] && parseInt(child.attributes['stroke-width'], 10) || undefined,
            opacity: child.attributes && child.attributes['opacity'] && parseFloat(child.attributes['opacity']),
            rotation: transform && transform.rotate && transform.rotate[0] && parseInt(transform.rotate[0], 10),
            pivotX: transform && transform.rotate && transform.rotate[1] && parseInt(transform.rotate[1], 10),
            pivotY: transform && transform.rotate && transform.rotate[2] && parseInt(transform.rotate[2], 10),
            scaleX: transform && transform.scale && transform.scale[0] && parseInt(transform.scale[0], 10),
            scaleY: transform && transform.scale && transform.scale[1] && parseInt(transform.scale[1], 10),
            translateX: transform && transform.translate && transform.translate[0] && parseInt(transform.translate[0], 10),
            translateY: transform && transform.translate && transform.translate[1] && parseInt(transform.translate[1], 10),
            items: child.children && buildItems(child.children)
        }
    }).filter(child => !!child);
    return items.length > 0 ? items : undefined;
}

/** https://stackoverflow.com/questions/17824145/parse-svg-transform-attribute-with-javascript **/
function parseTransform(transform){
    if(!transform) return undefined;
    let result = {};
    for(let i in transform = transform.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*[, ]?)+\))+/g)){
         let res = transform[i].match(/[\w\.\-]+/g);
        result[res.shift()] = res;
    }
    return result;
}