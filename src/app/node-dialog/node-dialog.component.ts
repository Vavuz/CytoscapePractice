import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ErrorStateMatcher } from '@angular/material/core';
import { CommonModule } from '@angular/common';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-node-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './node-dialog.component.html',
  styleUrls: ['./node-dialog.component.scss']
})
export class NodeDialogComponent {
  argumentGroups = [
    {
      name: 'Deductive Arguments',
      arguments: [
        'Categorical Syllogism',
        'Disjunctive Syllogism',
        'Hypothetical Syllogism',
        'Modus Ponens',
        'Modus Tollens',
        'Reductio ad Absurdum'
      ]
    },
    {
      name: 'Inductive Arguments',
      arguments: [
        'Inductive Generalization',
        'Statistical Syllogism',
        'Argument from Analogy',
        'Causal Inference',
        'Prediction'
      ]
    },
    {
      name: 'Presumptive Arguments',
      arguments: [
        'Argument from Authority',
        'Argument from Ignorance (Ad Ignorantiam)',
        'Presumptive Defeasible Generalization'
      ]
    },
    {
      name: 'Fallacious Arguments',
      arguments: [
        'Ad Hominem',
        'Straw Man',
        'False Dichotomy (False Dilemma)',
        'Begging the Question',
        'Slippery Slope'
      ]
    },
    {
      name: 'Other Logical Arguments',
      arguments: [
        'Argument from Sign',
        'Existential Statement',
        'Argument by Example',
        'Argument from Consequences',
        'Argument from Silence'
      ]
    },
    {
      name: 'Rhetorical Arguments',
      arguments: [
        'Ethical Appeal (Ethos)',
        'Emotional Appeal (Pathos)',
        'Logical Appeal (Logos)'
      ]
    },
    {
      name: 'Specialized Argument Types',
      arguments: [
        'Tu Quoque (You Too)',
        'Appeal to Tradition',
        'Appeal to Novelty',
        'Appeal to Popularity (Ad Populum)',
        'Gambler\'s Fallacy'
      ]
    }
  ];

  matcher = new MyErrorStateMatcher();
  titleControl = new FormControl('', [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<NodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.titleControl.valid && this.descriptionControl.valid) {
      this.dialogRef.close(this.data);
    }
  }
}