import { Component, OnInit, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import cytoscape from 'cytoscape';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';

import nodeHtmlLabel from 'cytoscape-node-html-label';
nodeHtmlLabel(cytoscape);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'CytoscapePractice';
  private cy: cytoscape.Core | undefined;
  elements: any[] = [];
  newNodeTitle: string = '';
  newNodeDescription: string = '';
  showModal: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public dialog: MatDialog) {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('selectionchange', e => {
        this.newNodeDescription = window.getSelection()!.toString();
      });
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cy = cytoscape({
        container: document.getElementById('cy'),
        elements: this.elements,
        style: [
          {
            selector: 'node',
            style: {
              'shape': 'round-rectangle',
              'background-color': '#e0f7fa',
              'border-color': '#00796b',
              'border-width': '2px',
              'font-size': '14px',
              'text-wrap': 'wrap',
              'text-valign': 'center',
              'text-halign': 'center',
              'padding-left': '10px',
              'padding-right': '10px',
              'padding-top': '5px',
              'padding-bottom': '5px',
              'width': 'label',
              'height': 'label',
              'text-max-width': '180px',
              'content': 'data(description)',
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
          name: 'preset'
        }
      });

      this.cy.nodeHtmlLabel([
        {
          query: 'node',
          halign: 'center',
          valign: 'top',
          halignBox: 'center',
          valignBox: 'top',
          cssClass: 'cy-title',
          tpl: (data: any) => `<div><strong>${data.title}</strong></div>`
        }
      ]);
    }
  }

  onAddNode() {
    const dialogRef = this.dialog.open(NodeDialogComponent, {
      width: '300px',
      data: { title: this.newNodeTitle, description: this.newNodeDescription }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newNode = {
          data: { 
            id: result.title, 
            title: result.title, 
            description: result.description
          },
          position: { x: 100, y: 100 }
        };

        this.elements.push(newNode);
        this.cy?.add(newNode);

        this.cy?.nodeHtmlLabel([
          {
            query: `node[id="${newNode.data.id}"]`,
            halign: 'center',
            valign: 'top',
            halignBox: 'center',
            valignBox: 'top',
            cssClass: 'cy-title',
            tpl: (data: any) => `<div><strong>${data.title}</strong></div>`
          }
        ]);
      }
    });
  }

  saveNode() {
    const newId = this.newNodeTitle;
    const newNode = {
      data: { 
        id: newId, 
        title: this.newNodeTitle, 
        description: this.newNodeDescription
      },
      position: { x: 100, y: 100 }
    };

    this.elements.push(newNode);
    this.cy?.add(newNode);

    this.cy?.nodeHtmlLabel([
      {
        query: `node[id="${newNode.data.id}"]`,
        halign: 'center',
        valign: 'top',
        halignBox: 'center',
        valignBox: 'top',
        cssClass: 'cy-title',
        tpl: (data: any) => `<div><strong>${data.title}</strong></div>`
      }
    ]);

    this.showModal = false;
  }

  cancelNode() {
    this.showModal = false;
  }
}
