import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserListComponent } from './user-list.component';
// import { UserService } from '../../../shared/services/entities/user.service'; // Mock or actual
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { of } from 'rxjs';
import { IUser } from '../../../shared/models/user.model';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  // let userService: UserService;

  const mockUsers: IUser[] = [
    { id: 1, displayName: 'Admin User', email: 'admin@example.com', roles: ['Administrator'] },
    { id: 2, displayName: 'Editor User', email: 'editor@example.com', roles: ['Editor'] }
  ];

  beforeEach(async () => {
    // const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    // userServiceSpy.getUsers.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      declarations: [ UserListComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
      ],
      // providers: [ { provide: UserService, useValue: userServiceSpy } ]
      providers: [] // No UserService provided for now
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    // userService = TestBed.inject(UserService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display mock users if UserService is not used', (done) => {
    component.users$.subscribe(users => {
      expect(users.length).toBe(3); // Based on mock data in component
      expect(users[0].displayName).toBe('Admin User');
      done();
    });
  });
});
