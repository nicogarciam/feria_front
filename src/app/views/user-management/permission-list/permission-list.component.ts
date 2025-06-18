import { Component, OnInit } from '@angular/core';
import { PermissionService } from '../../../shared/services/entities/permission.service';
import { IPermission } from '../../../shared/models/permission.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-permission-list',
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss']
})
export class PermissionListComponent implements OnInit {
  permissions$: Observable<IPermission[]>;
  displayedColumns: string[] = ['id', 'name']; // Example columns

  constructor(private permissionService: PermissionService) { }

  ngOnInit(): void {
    this.permissions$ = this.permissionService.getPermissions();
  }
}
