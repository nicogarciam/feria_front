import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RoleListComponent } from './role-list.component';
import { RoleService } from '../../../shared/services/entities/role.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { of } from 'rxjs';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let roleService: RoleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleListComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule
      ],
      providers: [ RoleService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
    roleService = TestBed.inject(RoleService);
    spyOn(roleService, 'getRoles').and.returnValue(of([])); // Mock getRoles
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch roles on init', () => {
    component.ngOnInit();
    expect(roleService.getRoles).toHaveBeenCalled();
  });
});
