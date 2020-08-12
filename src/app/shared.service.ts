import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  cy: any;

  constructor() { }

  init() {
    this.cy = cytoscape({
      elements: {
        nodes: [
          {
            data: { id: 'a' }
          },

          {
            data: { id: 'b' }
          }
        ],
        edges: [
          {
            data: { id: 'ab', source: 'a', target: 'b' }
          }
        ]
      },

      // so we can see the ids
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        }
      ],
      container: document.getElementById('cy')
    });
    window['cy'] = this.cy;
  }
}
