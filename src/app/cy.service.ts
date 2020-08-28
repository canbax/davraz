import { Injectable } from '@angular/core';
import { InterprettedQueryResult, GraphResponse } from './data-types';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class CyService {

  constructor(private _s: SharedService) {

  }

  loadGraph(resp: GraphResponse) {
    if (!resp) {
      console.log('error in graph response: ', resp);
      return;
    }

    const node_ids = {};
    // add nodes
    for (const node of resp.nodes) {
      if (!node) {
        continue;
      }
      node.attributes.id = 'n_' + node.v_id;
      if (this._s.cy.$id(node.attributes.id).length > 0) {
        continue;
      }
      node_ids[node.v_id] = true;
      this._s.cy.add({ data: node.attributes, classes: node.v_type })
    }

    for (const edge of resp.edges) {
      const fromId = 'n_' + edge.from_id;
      const toId = 'n_' + edge.to_id;
      edge.attributes.source = fromId;
      edge.attributes.target = toId;
      edge.attributes.id = 'e_' + fromId + '-' + toId;

      if (this._s.cy.$id(edge.attributes.id).length > 0) {
        continue;
      }
      if (this._s.cy.$id(fromId).length < 1 || this._s.cy.$id(toId).length < 1) {
        continue;
      }
      this._s.cy.add({ data: edge.attributes, classes: edge.e_type });
    }

    this._s.performLayout();
  }

  loadFromQuery(resp: InterprettedQueryResult) {
    console.log('from query: ', resp);
  }
}
