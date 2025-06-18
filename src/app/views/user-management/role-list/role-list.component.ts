import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../shared/services/entities/role.service';
import { IRole } from '../../../shared/models/role.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
  roles$: Observable<IRole[]>;
  displayedColumns: string[] = ['id', 'name', 'actions']; // Example columns

  constructor(private roleService: RoleService, private router: Router) { }

  ngOnInit(): void {
    this.roles$ = this.roleService.getRoles();
  }

  editRole(role: IRole): void {
    this.router.navigate(['/user-management/roles/edit', role.id]); // Example navigation
  }

  createNewRole(): void {
    this.router.navigate(['/user-management/roles/new']); // Example navigation
  }

  deleteRole(roleId: number): void {
    if (confirm(`Are you sure you want to delete role ${roleId}?`)) {
      this.roleService.deleteRole(roleId).subscribe(() => {
        this.roles$ = this.roleService.getRoles(); // Refresh list
        // Add snackbar notification here
      });
    }
  }
}
