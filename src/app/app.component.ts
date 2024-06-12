import { Component, OnInit, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import cytoscape from 'cytoscape';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
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
              'width': '200px',
              'height': 'auto',
              'background-color': '#FFFFFF',
              'border-color': '#000',
              'border-width': '1px',
              'font-size': '12px',
              'text-wrap': 'wrap',
              'text-max-width': '180px',
              'content': 'data(description)',
            }
          },
          {
            selector: 'node:parent',
            style: {
              'shape': 'round-rectangle',
              'background-color': '#f9f9f9',
              'border-width': '1px',
              'border-color': '#555',
              'text-valign': 'top',
              'text-halign': 'center',
              'font-size': '14px',
              'font-weight': 'bold',
              'content': 'data(title)',
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
    const dialogRef = this.dialog.open(NodeDialogComponent, {
      width: '300px',
      data: { title: this.newNodeTitle, description: this.newNodeDescription }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newNode = {
          data: { id: result.title, title: result.title, description: result.description }
        };

        this.elements.push(newNode);
        this.cy?.add(newNode);

        this.cy?.layout({
          name: 'grid',
          rows: 1
        }).run();
      }
    });
  }

  saveNode() {
    const newId = this.newNodeTitle;
    const newNode = {
      data: { id: newId, title: this.newNodeTitle, description: this.newNodeDescription }
    };

    this.elements.push(newNode);
    this.cy?.add(newNode);

    this.cy?.layout({
      name: 'grid',
      rows: 1
    }).run();

    this.showModal = false;
  }

  cancelNode() {
    this.showModal = false;
  }
}
