// select-provider.component.ts
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { IProvider } from '@models/provider.model';
import { ProviderService } from '@services/entities/provider.service';
import { TranslateService } from '@ngx-translate/core';
import {ProviderPopupComponent} from "@components/providers/provider-popup/provider-popup.component";

@Component({
  selector: 'app-select-provider',
  templateUrl: './select-provider.component.html',
  styleUrls: ['./select-provider.component.scss']
})
export class SelectProviderComponent implements OnInit, OnDestroy {
  @Input() selectedProvider: IProvider;
  @Input() layout = 'column';
  @Output() providerSelected = new EventEmitter<IProvider>();

  providerSearch = new FormControl('');
  filteredProviders: IProvider[] = [];
  loadingProviders = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private providerService: ProviderService,
    private dialog: MatDialog,
    private t: TranslateService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.providerSearch.valueChanges
        .pipe(
          debounceTime(70),
          tap(() => this.loadingProviders = true),
          switchMap(value => this.providerService.query({ q: value })
            .pipe(
              finalize(() => this.loadingProviders = false)
            )
          )
        )
        .subscribe(
          result => this.filteredProviders = result.body,
          error => {
            console.error('Error fetching providers:', error);
            this.loadingProviders = false;
          }
        )
    );
  }

  displayProviderFn = (item?: any): string => {
    if (item === 'new') {
      this.addProvider({}, true);
      return '';
    } else if (item) {
      this.selectedProvider = item;
      this.providerSelected.emit(this.selectedProvider);
      return item.name;
    }
    return '';
  }

  private addProvider(data: {}, isNew: boolean) {
    const title = (isNew ? this.t.instant('new') : this.t.instant('update')) + 
                 ' ' + this.t.instant('provider');
    const dialogRef = this.dialog.open(ProviderPopupComponent, {
      width: '850px',
      disableClose: true,
      data: { title, item: data }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.providerService.find(res).subscribe(
          provider => {
            this.selectedProvider = provider.body;
            this.providerSelected.emit(this.selectedProvider);
          }
        );
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
