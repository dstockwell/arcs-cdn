/*
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */


let debug = true;

/**
 * Traverse the list of query selectors. After each selector, both the shadow
 * & light DOM trees will be traversed.
 *
 * Selectors must be specific - if a selector matches multiple items
 * (including results in both the light & shadow trees) this method will error
 * out.
 *
 * The selector containing a shadowRoot must be explicitly specified. Any
 * specified selector (e.g. every selector in 'querySelectors') will have both
 * light & shadow children searched.
 */
function pierceShadows(querySelectors) {
  return _pierceShadows(document, querySelectors);
}

/** As #pierceShadows, but asserts that only a single result is found. */
function pierceShadowsSingle(querySelectors) {
  let result = _pierceShadows(document, querySelectors);
  if (result.length>1) {
    throw Error(`too many results found ${result}`);
  }
  return result[0];
}

function _nodelistToArray(nl) {
  if (!nl) return [];
  var l=nl.length, r = new Array(l);
  while(l--){r[l]=nl[l]};
  return r;
}

function _pierceShadows(node, querySelectors, depth) {
  if (undefined===depth) depth=0;


  const remainingSelectors = querySelectors.slice(1);
  let nextNodes = node.querySelectorAll(querySelectors[0]);


  if (0==remainingSelectors.length) {
    !debug || console.log(`${Array(depth+1).join(' ')}end of recursion at ${nextNodes}`);
    return nextNodes;
  }

  var l=nextNodes.length, nextNodesArr = new Array(l);
  while(l--){nextNodesArr[l]=nextNodes[l]};

  let results = nextNodesArr.reduce((accumulator, currentValue) => {
    !debug || console.log(`${Array(depth+1).join(' ')}descending to light ${currentValue} with selector ${remainingSelectors[0]}`);
    let lightNodes = _pierceShadows(currentValue, remainingSelectors, depth+1);

    let shadowNodes;
    if (currentValue && currentValue.shadowRoot) {
      !debug || console.log(`${Array(depth+1).join(' ')}descending to shadow ${currentValue.shadowRoot} with selector ${remainingSelectors[0]}`);
      shadowNodes = _pierceShadows(currentValue.shadowRoot, remainingSelectors, depth+1);
    }
    !debug || console.log(`${Array(depth+1).join(' ')}returning light ${lightNodes} and shadow ${shadowNodes}`);

    return accumulator
      .concat(_nodelistToArray(lightNodes))
      .concat(_nodelistToArray(shadowNodes));
  }, []);
  return results;
}