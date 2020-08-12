import { Injectable } from '@angular/core';
import { InterprettedQueryResult, GraphResponse } from './data-types';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class CyService {

  constructor(private _s: SharedService) { }

  init(container) {

  }

  loadGraph(resp: GraphResponse) {
    if (!resp) {
      console.log('error in graph response: ', resp);
      return;
    }

    const node_ids = {};
    // add nodes
    for (const node of resp.nodes) {
      node.attributes.id = 'n' + node.v_id;
      node_ids[node.v_id] = true;
      this._s.cy.add({ data: node.attributes, classes: node.v_type })
    }

    for (const edge of resp.edges) {
      if (!node_ids[edge.from_id] || !node_ids[edge.to_id]) {
        continue;
      }
      edge.attributes.id = edge.e_type;
      edge.attributes.source = 'n' + edge.from_id;
      edge.attributes.target = 'n' + edge.to_id;
      this._s.cy.add({ data: edge.attributes, classes: edge.e_type });
    }
  }

  loadFromQuery(resp: InterprettedQueryResult) {
    console.log('from query: ', resp);
  }
}
