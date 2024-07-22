import { Component, OnInit, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import cytoscape from 'cytoscape';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { RelationDialogComponent } from './relation-dialog/relation-dialog.component';

import nodeHtmlLabel from 'cytoscape-node-html-label';
nodeHtmlLabel(cytoscape);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title: string = 'CytoscapePractice';
  private cy: cytoscape.Core | undefined;
  elements: any[] = [];
  newNodeTitle: string = '';
  newNodeDescription: string = '';
  showModal: boolean = false;
  nodeCounter: number = 0;
  edgeCounter: number = 0;
  selectedNode?: cytoscape.NodeSingular | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public dialog: MatDialog
  ) {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('selectionchange', (e) => {
        this.newNodeDescription = window.getSelection()!.toString();
      });
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize Cytoscape instance
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
            },
          },
          {
            selector: 'node[shape="diamond"]',
            style: {
              'shape': 'diamond',
              'background-color': '#f6ad4b',
              'border-color': '#a9531f',
              'border-width': '2px',
              'font-size': '12px',
              'text-valign': 'center',
              'text-halign': 'center',
              'width': 'label',
              'height': 'label',
              'text-max-width': '150px',
              'content': 'data(title)',
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'mid-target-arrow-color': '#ccc',
              'mid-target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
            },
          },
        ],
        layout: {
          name: 'preset',
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        autoungrabify: false,
      });

      // Handle double-click events on nodes
      this.cy.on('dblclick', 'node', (event) => {
        event.preventDefault();
        this.onNodeDoubleClick(event.target);
      });
    }
  }

  onAddNode() {
    const dialogRef = this.dialog.open(NodeDialogComponent, {
      width: '300px',
      data: { title: this.newNodeTitle, description: this.newNodeDescription },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newNode = {
          data: {
            id: `${this.nodeCounter}`,
            title: result.title,
            description: result.description,
          },
          position: { x: 100, y: 100 },
        };

        this.nodeCounter++;
        this.elements.push(newNode);
        const addedNode = this.cy?.add(newNode);

        // Add HTML label to the node
        this.cy?.nodeHtmlLabel([
          {
            query: `node[id="${newNode.data.id}"]`,
            halign: 'center',
            valign: 'center',
            halignBox: 'center',
            valignBox: 'center',
            cssClass: 'cy-title',
            tpl: (data: any) => `
              <div style="border: 1px solid #000; border-radius: 5px; padding: 10px; background-color: #fff; cursor: pointer;">
                <div style="font-weight: bold; text-align: center;">${data.title}</div>
                <hr style="margin: 5px 0;">
                <div style="text-align: left;">${data.description}</div>
              </div>`,
          },
        ]);

        addedNode?.forEach((node) => {
          node.grabify();
          node.on('grab', () => {
            node.grabify();
          });
        });
      }
    });
  }

  onNodeDoubleClick(node: cytoscape.NodeSingular) {
    // Prevent creating connections starting from a relation node (diamond shape)
    if (node.data('shape') === 'diamond') {
      return;
    }
  
    if (this.selectedNode) {
      const existingEdge = this.cy?.edges(`[source="${this.selectedNode.id()}"][target="${node.id()}"]`);
      if (existingEdge && existingEdge.length > 0) {
        return;
      }
  
      const dialogRef = this.dialog.open(RelationDialogComponent, {
        width: '300px',
        data: { relationType: '' },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          let midX, midY;
  
          // Calculate position for self-loop connections
          if (this.selectedNode!.id() === node.id()) {
            const nodePosition = this.selectedNode!.position();
            midX = nodePosition.x + 150;
            midY = nodePosition.y;
          } else {
            // Calculate midpoint
            const sourcePosition = this.selectedNode!.position();
            const targetPosition = node.position();
            midX = (sourcePosition.x + targetPosition.x) / 2;
            midY = (sourcePosition.y + targetPosition.y) / 2;
          }
  
          // Create relation node at calculated position
          const relationNode = {
            data: {
              id: `r${this.edgeCounter}`,
              title: result.relationType,
              description: '',
              shape: 'diamond',
              'background-color': '#f0cd7e',
            },
            position: { x: midX, y: midY },
          };
  
          this.cy?.add(relationNode);
  
          // Create edges from source to relation node and from relation node to target
          this.cy?.add([
            {
              group: 'edges',
              data: {
                id: `e${this.edgeCounter}-1`,
                source: this.selectedNode!.id(),
                target: `r${this.edgeCounter}`,
                label: result.relationType,
              },
            },
            {
              group: 'edges',
              data: {
                id: `e${this.edgeCounter}-2`,
                source: `r${this.edgeCounter}`,
                target: node.id(),
                label: result.relationType,
              },
            },
          ]);
  
          this.edgeCounter++;
          this.selectedNode = null;
        }
      });
    } else {
      this.selectedNode = node;
    }
  }  

  saveNode() {
    this.showModal = false;
  }

  cancelNode() {
    this.showModal = false;
  }
}