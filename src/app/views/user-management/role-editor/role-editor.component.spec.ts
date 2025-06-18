import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { RoleEditorComponent } from './role-editor.component';
import { RoleService } from '../../../shared/services/entities/role.service';
import { PermissionService } from '../../../shared/services/entities/permission.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('RoleEditorComponent', () => {
  let component: RoleEditorComponent;
  let fixture: ComponentFixture<RoleEditorComponent>;
  let mockRoleService: any;
  let mockPermissionService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRoleService = jasmine.createSpyObj(['getRoleById', 'createRole', 'updateRole']);
    mockPermissionService = jasmine.createSpyObj(['getPermissions']);
    mockRouter = jasmine.createSpyObj(['navigate']);
    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => null }), // Default to create mode
      snapshot: { paramMap: { get: () => '1'} } // for coverage
    };

    await TestBed.configureTestingModule({
      declarations: [ RoleEditorComponent ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatCardModule
      ],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleEditorComponent);
    component = fixture.componentInstance;
    mockPermissionService.getPermissions.and.returnValue(of([])); // Default empty permissions
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form for creating new role', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.roleForm.get('name')?.value).toBe('');
  });

  it('should load permissions on init', () => {
    expect(mockPermissionService.getPermissions).toHaveBeenCalled();
  });

});
