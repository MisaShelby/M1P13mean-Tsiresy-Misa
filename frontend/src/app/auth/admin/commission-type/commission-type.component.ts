import { Component, OnInit } from '@angular/core';
import { CommissionTypeService } from '../commission-type.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';

export interface CommissionType {
  _id?: string;
  nom: string;
  tarif: Number;
  description?: string;
}
@Component({
  selector: 'app-commission-type',
  imports: [FormsModule,CommonModule ],
  templateUrl: './commission-type.html',
  styleUrl: './commission-type.css',
})
export class CommissionTypeComponent implements OnInit {

  commissionTypes: CommissionType[] = [];
  newCommission: CommissionType = { nom: '',tarif: 0 };

  constructor(private commissionService: CommissionTypeService) {}

  ngOnInit(): void {
    this.loadCommissionTypes();
  }

  loadCommissionTypes() {
    this.commissionService.getAllCommissionTypes()
      .subscribe(data => this.commissionTypes = data);
  }

  createCommission() {
    this.commissionService.createCommissionType(this.newCommission)
      .subscribe(() => {
        this.loadCommissionTypes();
        this.newCommission = { nom: '',tarif: 0 };
      });
  }

  deleteCommission(id: string) {
    this.commissionService.deleteCommissionType(id)
      .subscribe(() => this.loadCommissionTypes());
  }
}