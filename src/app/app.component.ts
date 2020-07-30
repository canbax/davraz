import { Component, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { TigerGraphApiClientService } from './tiger-graph-api-client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cy: any = null;

  constructor(private _tgApi: TigerGraphApiClientService) {
    this._tgApi.simpleRequest();
  }

  ngOnInit(): void {
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
  title = 'graph-imager';

}
