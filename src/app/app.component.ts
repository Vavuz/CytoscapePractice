import { Component, OnInit, Inject, Renderer2, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ContextMenuComponent } from './context-menu/context-menu.component';

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
    MatSnackBarModule,
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
  contextMenu: HTMLElement | null = null;
  connectionToRelationNode: boolean = false;

  @ViewChild('contextMenuContainer', { read: ViewContainerRef }) contextMenuContainer!: ViewContainerRef;
  private contextMenuRef: ComponentRef<ContextMenuComponent> | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
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
            selector: 'node[nodeType="relation"]',
            style: {
              'shape': 'diamond',
              'background-color': '#f6ad4b',
              'border-color': '#a9531f',
              'border-width': '2px',
              'font-size': '12px',
              'text-valign': 'center',
              'text-halign': 'center',
              'width': '90px',
              'height': '40px',
              'text-max-width': '100px',
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
              'control-point-step-size': 75,
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

      // Handle right-click events on nodes
      this.cy.on('cxttap', 'node', (event) => {
        event.preventDefault();
        this.showContextMenu(event.target, event.originalEvent);
      });

      // Prevent default context menu on the entire document
      this.renderer.listen('document', 'contextmenu', (event) => {
        event.preventDefault();
      });

      // Handle click on background to hide context menu and deselect node
      this.cy.on('tap', (event) => {
        if (event.target === this.cy) {
          this.hideContextMenu();
          this.selectedNode = null;
        }
      });
    }
  }

  showContextMenu(node: cytoscape.NodeSingular, event: MouseEvent) {
    this.hideContextMenu();
  
    const contextMenuRef = this.contextMenuContainer.createComponent(ContextMenuComponent);
    contextMenuRef.instance.editNode.subscribe(() => {
      this.hideContextMenu();
      this.editNode(node);
    });
  
    const domElem = (contextMenuRef.hostView as any).rootNodes[0] as HTMLElement;
    domElem.style.position = 'absolute';
    domElem.style.top = `${event.clientY}px`;
    domElem.style.left = `${event.clientX}px`;
    domElem.style.zIndex = '1000';
  
    this.contextMenuRef = contextMenuRef;
  }
  
  hideContextMenu() {
    if (this.contextMenuRef) {
      this.contextMenuRef.destroy();
      this.contextMenuRef = null;
    }
  }

  editNode(node: cytoscape.NodeSingular) {
    const isRelationNode = node.data('nodeType') === 'relation';
    var dialogRef;

    if(isRelationNode) {
      dialogRef = this.dialog.open(RelationDialogComponent, {
        width: '300px',
        data: { title: node.data('title'), isEditMode: true },
      });
    }
    else {
      dialogRef = this.dialog.open(NodeDialogComponent, {
        width: '300px',
        data: { title: node.data('title'), description: node.data('description'), isEditMode: true },
      });
    }  

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (isRelationNode) {
          node.data('title', result.relationType);
        } else {
          node.data('title', result.title);
          node.data('description', result.description);
        }
      }
    });
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
            nodeType: 'node',
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
        
        // Each node becomes grabbable
        addedNode?.forEach((node) => {
          node.grabify();
          node.on('grab', () => {
            node.grabify();
          });
        });
      }
    });
  }

  areConnected(firstNode: cytoscape.NodeSingular, secondNode: cytoscape.NodeSingular) {
    // Collect all final destination nodes
    const connectedFinalDestinations = new Set<string>();
    const sourceId = firstNode!.id();

    // Get all outgoing edges and target nodes starting from the source node
    const outgoingEdges = this.cy?.$(`#${sourceId}`).outgoers('edge');

    outgoingEdges?.forEach((edge) => {
      const target = edge.target();
    
      if (target.data('nodeType') === 'relation') {
        // If the target is a relation node, get its outgoing edges
        const relationOutgoingEdges = target.outgoers('edge');
    
        // Add each of the targets of these edges to the final destination set
        relationOutgoingEdges.forEach((relationEdge) => {
          const relationTarget = relationEdge.target();
          connectedFinalDestinations.add(relationTarget.id());
        });
      } else {
        // If the target is a regular node, add it directly to the final destination set
        connectedFinalDestinations.add(target.id());
      }
    });

    let existingEdge = false;

    if (connectedFinalDestinations.has(secondNode.id())) {
      existingEdge = true;
    }
    else if (secondNode.data('nodeType') === 'relation') {
      // Check if trying to connect to a relation node that connects to any nodes in connectedFinalDestinations
      const relationOutgoingEdges = secondNode.outgoers('edge');
      relationOutgoingEdges.forEach((relationEdge) => {
        const relationTarget = relationEdge.target();
        if (connectedFinalDestinations.has(relationTarget.id())) {
          existingEdge = true;
        }
      });
    }

    return existingEdge;
  }

  onNodeDoubleClick(node: cytoscape.NodeSingular) {
    // Prevent creating connections starting from a relation node
    if (node.data('nodeType') === 'relation') {
      if (!this.selectedNode) {
        this.snackBar.open('Connections cannot start from a relation node', 'Close', {
          duration: 3000,
        });
        return;
      }
      
      this.connectionToRelationNode = true;
    }

    if (!this.selectedNode) {
      this.selectedNode = node;
      return;
    }

    // Alert the user if a connection already exists
    if (this.areConnected(this.selectedNode, node)) {
      this.snackBar.open('This connection already exists', 'Close', {
        duration: 3000,
      });

      this.selectedNode = null;
      return;
    }

    const dialogRef = this.dialog.open(RelationDialogComponent, {
      width: '300px',
      data: {
        relationType: '',
        directConnection: this.connectionToRelationNode ? true : false,
        isEditMode: false,
        isConnectionToRelationNode: this.connectionToRelationNode
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.directConnection) {
          this.cy?.add({
            group: 'edges',
            data: {
              id: `e${this.edgeCounter}`,
              source: this.selectedNode!.id(),
              target: node.id(),
              label: result.relationType,
            },
          });
        } else {
          let midX, midY;

          // Calculate position for self-loop connections
          if (this.selectedNode!.id() === node.id()) {
            const nodePosition = this.selectedNode!.position();
            midX = nodePosition.x + 150;
            midY = nodePosition.y;
          } else {
            // Calculate midpoint for any other connection
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
              nodeType: 'relation',
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
        }

        this.edgeCounter++;
        this.selectedNode = null;
        this.connectionToRelationNode = false;
      }
    });
  }

  saveNode() {
    this.showModal = false;
  }

  cancelNode() {
    this.showModal = false;
  }
}