import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { UserRoleAssignerComponent } from './user-role-assigner.component';
import { RoleService } from '../../../shared/services/entities/role.service';
// import { UserService } from '../../../shared/services/entities/user.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IUser } from '../../../shared/models/user.model';
import { IRole } from '../../../shared/models/role.model';

describe('UserRoleAssignerComponent', () => {
  let component: UserRoleAssignerComponent;
  let fixture: ComponentFixture<UserRoleAssignerComponent>;
  let mockRoleService: any;
  // let mockUserService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockUser: IUser = { id: 1, displayName: 'Test User', email: 'test@example.com', roles: ['Viewer'] };
  const mockRoles: IRole[] = [
    { id: 1, name: 'Admin', permissions: [] },
    { id: 2, name: 'Editor', permissions: [] },
    { id: 3, name: 'Viewer', permissions: [] }
  ];

  beforeEach(async () => {
    mockRoleService = jasmine.createSpyObj(['getRoles']);
    // mockUserService = jasmine.createSpyObj(['getUserById', 'updateUserRoles']);
    mockRouter = jasmine.createSpyObj(['navigate']);

    // Setup mock for ActivatedRoute
    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => '1' }), // Simulate route param /1
      snapshot: { paramMap: { get: () => '1'} }
    };

    // Mock service calls for component initialization
    // mockUserService.getUserById.and.returnValue(of(mockUser));
    mockRoleService.getRoles.and.returnValue(of(mockRoles));


    await TestBed.configureTestingModule({
      declarations: [ UserRoleAssignerComponent ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatCardModule
      ],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        // { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRoleAssignerComponent);
    component = fixture.componentInstance;

    // Override the mockUserService directly in the component instance for this test
    component['mockUserService'].getUserById = () => of(mockUser);
    component['mockUserService'].updateUserRoles = (userId, roles) => of(mockUser); // Mock successful update

    fixture.detectChanges(); // This will trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data and all roles on init', (done) => {
    fixture.whenStable().then(() => { // Wait for async operations in ngOnInit
      expect(component.user).toEqual(mockUser);
      expect(mockRoleService.getRoles).toHaveBeenCalled();
      expect(component.rolesFormArray.length).toBe(mockRoles.length);
      done();
    });
  });

  it('should check the correct checkboxes for user existing roles', (done) => {
     fixture.whenStable().then(() => {
      const viewerRoleControl = component.rolesFormArray.controls.find(control => control.get('name')?.value === 'Viewer');
      expect(viewerRoleControl?.get('selected')?.value).toBeTrue();
      const adminRoleControl = component.rolesFormArray.controls.find(control => control.get('name')?.value === 'Admin');
      expect(adminRoleControl?.get('selected')?.value).toBeFalse();
      done();
    });
  });

});
