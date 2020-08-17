import { Injectable } from '@angular/core';
import { InterprettedQueryResult, GraphResponse } from './data-types';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class CyService {

  constructor(private _s: SharedService) {

  }

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
      if (!node) {
        continue;
      }
      node.attributes.id = 'n' + node.v_id.replace(' ', '_');
      if (this._s.cy.$('#' + node.attributes.id).length > 0) {
        continue;
      }
      node_ids[node.v_id] = true;
      this._s.cy.add({ data: node.attributes, classes: node.v_type })
    }

    for (const edge of resp.edges) {
      if (!node_ids[edge.from_id] || !node_ids[edge.to_id]) {
        continue;
      }
      const fromId = 'n' + edge.from_id.replace(' ', '_');
      const toId = 'n' + edge.to_id.replace(' ', '_');
      edge.attributes.source = fromId;
      edge.attributes.target = toId;
      edge.attributes.id = fromId + '-' + toId;

      if (this._s.cy.$('#' + edge.attributes.id).length > 0) {
        continue;
      }
      this._s.cy.add({ data: edge.attributes, classes: edge.e_type });
    }

    this._s.runLayout();
  }

  loadFromQuery(resp: InterprettedQueryResult) {
    console.log('from query: ', resp);
  }
}
