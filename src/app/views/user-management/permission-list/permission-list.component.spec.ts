import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PermissionListComponent } from './permission-list.component';
import { PermissionService } from '../../../shared/services/entities/permission.service';
import { MatTableModule } from '@angular/material/table';
import { of } from 'rxjs';

describe('PermissionListComponent', () => {
  let component: PermissionListComponent;
  let fixture: ComponentFixture<PermissionListComponent>;
  let permissionService: PermissionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionListComponent ],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatTableModule
      ],
      providers: [ PermissionService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionListComponent);
    component = fixture.componentInstance;
    permissionService = TestBed.inject(PermissionService);
    spyOn(permissionService, 'getPermissions').and.returnValue(of([])); // Mock getPermissions
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch permissions on init', () => {
    component.ngOnInit();
    expect(permissionService.getPermissions).toHaveBeenCalled();
  });
});
