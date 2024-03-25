import { Component, OnInit, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import cytoscape from 'cytoscape';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'CytoscapePractice';
  private cy: cytoscape.Core | undefined;
  elements = [
    {
      data: { id: 'a' }
    },
    {
      data: { id: 'b' }
    },
    {
      data: { id: 'c' }
    },
    {
      data: { id: 'd' },
    },
    {
      data: { id: 'ab', source: 'a', target: 'b' }
    },
    {
      data: { id: 'cd', source: 'c', target: 'd' }
    },
    {
      data: { id: 'ad', source: 'a', target: 'd' }
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cy = cytoscape({
        container: document.getElementById('cy'),
        elements: this.elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#626',
              'label': 'data(id)'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle'
            }
          }
        ],

        layout: {
          name: 'grid',
          rows: 1
        }
      });
    }
  }

  onAddNode() {
    const newId = `n${this.elements.length + 1}`;
    const newNode = {
      data: { id: newId }
    };

    this.elements.push(newNode);
    this.cy?.add(newNode);

    this.cy?.layout({
      name: 'grid', // Or any layout that suits your needs
      rows: 1
    }).run();
  }
}
